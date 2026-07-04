/* eslint-env node */
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
// 引入官方 KV 套件 (Vercel KV 已棄用，改為官方建議的 Upstash Redis)
import { Redis } from '@upstash/redis';
const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
// 1. 【新增】確保本地環境能讀取 .env
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// 🚀 任務 C：Gemini API 專用 Schema 定義 (Structured Outputs)
// 透過嚴格定義 Schema，我們甚至不用在 Prompt 裡寫 JSON 範例，大幅節省 Input Tokens，並且保證輸出符合結構的 JSON 格式。
// ==========================================
const recipeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: "翻譯並優化後的台灣繁體中文菜名 (看起來要好吃)" },
    desc: { type: SchemaType.STRING, description: "一段約30-50字的繁體中文介紹，描述口感與特色，吸引人嘗試" },
    diff: {
      type: SchemaType.STRING,
      enum: ["簡單", "中等", "困難"], // ✅ 修正：用 enum 鎖定值域，取代原本只靠 description 文字約束
    },
    time: { type: SchemaType.STRING, description: "預估製作時間 (例如：25分鐘)" },
    tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "3個相關標籤" },
    nutr: {
      type: SchemaType.OBJECT,
      properties: {
        cal: { type: SchemaType.NUMBER, description: "預估卡路里" },
        pro: { type: SchemaType.STRING, description: "預估蛋白質(克)" },
        car: { type: SchemaType.STRING, description: "預估碳水(克)" }
      },
      required: ["cal", "pro", "car"]
    },
    ing: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          i: { type: SchemaType.STRING, description: "食材名稱(繁體中文)" },
          a: { type: SchemaType.STRING, description: "份量(台灣常用單位)" }
        },
        required: ["i", "a"]
      }
    },
    steps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          txt: { type: SchemaType.STRING, description: "詳細步驟說明" },
          act: { type: SchemaType.STRING, description: "關鍵動作(切丁、汆燙等，若無則留空)" }
        },
        required: ["txt", "act"]
      }
    }
  },
  required: ["title", "desc", "diff", "time", "tags", "nutr", "ing", "steps"]
};

export default async function handler(req, res) {
  // CORS 設定
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipeData } = req.body;

    if (!recipeData) {
      throw new Error('沒有收到食譜資料');
    }

    // ==========================================
    // 🚀 任務 B：資料庫快取 (Cache Hit 邏輯)
    // ==========================================
    const cacheKey = `recipe:ai:${recipeData.idMeal}`;

    try {
      const cachedData = await kv.get(cacheKey);
      if (cachedData) {
        console.log(`[Cache Hit] 命中快取！瞬間回傳食譜: ${cachedData.title}`);
        return res.status(200).json(cachedData);
      }
    } catch (kvError) {
      // 如果 Redis 連線失敗，我們不該讓整支 API 掛掉，而是印出警告，然後繼續走原本的 AI 流程
      console.warn(`[Redis Warning] 快取讀取失敗: ${kvError.message}`);
    }

    console.log(`[Cache Miss] 未命中快取，準備呼叫 AI 分析食譜 ID: ${recipeData.idMeal}`);

    // ==========================================
    // 🚀 任務 C：Prompt 優化 (移除 JSON 範本，改用 Schema)
    // ==========================================
    const prompt = `
      你是專業的台灣五星級大廚與營養師。
      請將以下提供的原始英文食譜資料 (Raw Data)，翻譯並轉換為台灣繁體中文。

      原始資料：
      ${JSON.stringify({
        // 為了節省 Input Token，只傳入需要翻譯的核心資料，過濾掉多餘的欄位
        idMeal: recipeData.idMeal,
        strInstructions: recipeData.strInstructions,
        ingredients: Object.keys(recipeData)
          .filter(k => k.startsWith('strIngredient') && recipeData[k])
          .map(k => ({
            name: recipeData[k],
            measure: recipeData[`strMeasure${k.replace('strIngredient', '')}`]
          }))
      })}

      注意：
      1. 若原始資料缺少某些數值(如營養)，請根據食材進行專業估算。
      2. 翻譯必須在地化，例如 "Cornstarch" 翻為 "太白粉" 或 "玉米粉"。
    `;

    // 2. 【升級】加入 Retry 機制與 Model Fallback
    const maxRetries = 2;
    let attempt = 0;
    let parsedData = null;
    let currentModelName = "gemini-3.1-flash-lite"; // 預設主模型（官方 2026 正式發布的穩定模型 ID）

    while (attempt <= maxRetries) {
      try {
        const model = genAI.getGenerativeModel({
          model: currentModelName,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema, // 🚀 將嚴格定義的 Schema 綁定上去
          }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 3. 有 responseSchema 保底後，這段只是額外防呆，理論上已經不太會觸發，
        //    但保留著無妨，可以應付極少數模型仍夾帶 Markdown 的邊角案例
        let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
           throw new Error("AI 回傳的內容找不到有效的 JSON 格式");
        }

        const jsonString = jsonMatch[0];
        parsedData = JSON.parse(jsonString);
        break; // 成功解析，跳出 Retry 迴圈

      } catch (err) {
        attempt++;
        console.warn(`[嘗試 ${attempt}] AI 處理失敗 (使用模型 ${currentModelName}):`, err.message);

        if (attempt > maxRetries) {
          throw err; // 超過最大重試次數，將錯誤往外丟
        }

        // 遇到錯誤，暫停 1 秒鐘
        await new Promise(res => setTimeout(res, 1000));

        // 如果主模型失敗，通常是因為塞車。我們在重試時自動降級切換到備援模型
        currentModelName = "gemini-2.5-flash";
      }
    }

    // ✅ 修正：schema 欄位已改名為 title（原本印 title_zh 會是 undefined）
    // ✅ 修正：補回原始 ID —— 這是「照抄」不需要 AI 生成的資料，
    //    直接用程式賦值，比讓 AI 猜測更省 token、也保證不會出錯
    parsedData.id = recipeData.idMeal;

    console.log("AI 轉換成功:", parsedData.title);

    // ==========================================
    // 🚀 任務 B：資料庫快取 (Cache Set 邏輯)
    // ==========================================
    try {
      // 將成功翻譯的結果存入 Redis。下次有人點擊同一個食譜，就會觸發上方的 Cache Hit
      await kv.set(cacheKey, parsedData);
      console.log(`[Cache Set] 成功寫入 Redis 快取`);
    } catch (kvSetError) {
      console.warn(`[Redis Warning] 快取寫入失敗: ${kvSetError.message}`);
    }

    res.status(200).json(parsedData);

  } catch (error) {
    console.error("AI Processing Error:", error);
    // 回傳 500 時，把錯誤訊息轉成字串，方便前端除錯
    res.status(500).json({ error: "AI 轉換失敗", details: error.message });
  }
}