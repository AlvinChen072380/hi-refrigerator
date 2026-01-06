/* eslint-env node */
import { GoogleGenerativeAI } from "@google/generative-ai";
// 1. 【新增】確保本地環境能讀取 .env
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // 2. 【修正】模型名稱改為正確的 gemini-2.5-flash
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite", 
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt =`
      你是專業的台灣五星級大廚與營養師。
      請將以下提供的原始英文食譜資料 (Raw Data)，轉換為台灣繁體中文的使用者友善格式。
      
      原始資料：
      ${JSON.stringify(recipeData)}

      請嚴格遵守以下 JSON 結構回傳資料 (不要包含任何 Markdown 標記)：

      {
        "id": "原始ID",
        "title_en": "原始英文標題",
        "title_zh": "翻譯並優化後的台灣繁體中文菜名 (看起來要好吃)",
        "description_zh": "一段約30-50字的繁體中文介紹，描述口感與特色，吸引人嘗試",
        "difficulty": "簡單" | "中等" | "困難",
        "time_estimate": "預估製作時間 (例如：25分鐘)",
        "tags": ["標籤1", "標籤2", "標籤3"],
        "nutrition_estimate": {
          "calories": number (預估卡路里),
          "protein": "預估蛋白質 (克)",
          "carbon": "預估碳水 (克)"
        },
        "ingredients": [
          {
            "item": "食材名稱 (繁體中文)",
            "amount": "份量 (轉換為台灣常用單位，如公克、大匙、碗)",
            "original_text": "保留原始英文食材描述以供對照"
          }
        ],
        "steps": [
          {
            "step_number": 1,
            "content": "詳細步驟說明 (繁體中文，語氣親切，邏輯清晰)",
            "action_tag": "關鍵動作 (如：切丁、汆燙、爆香，若無則留空)"
          }
        ]
      }
      
      注意：
      1. 若原始資料缺少某些數值(如營養)，請根據食材進行專業估算。
      2. 翻譯必須在地化，例如 "Cornstarch" 翻為 "太白粉" 或 "玉米粉"。
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 3. 【修正】使用更強健的方式擷取 JSON，避免 SyntaxError
    // 即使設定了 responseMimeType，這層防護依然是必要的
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
       throw new Error("AI 回傳的內容找不到有效的 JSON 格式");
    }

    const jsonString = jsonMatch[0];
    const parsedData = JSON.parse(jsonString);

    console.log("AI 轉換成功:", parsedData.title_zh);    

    res.status(200).json(parsedData);

  } catch (error) {
    console.error("AI Processing Error:", error);
    // 回傳 500 時，把錯誤訊息轉成字串，方便前端除錯
    res.status(500).json({ error: "AI 轉換失敗", details: error.message });
  }
}