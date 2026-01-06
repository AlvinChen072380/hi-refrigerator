// src/data/geminiService.jsx
/* import { GoogleGenerativeAI } from "@google/generative-ai"; */

// 1. 使用前端 Key
/* const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY); */

/* export const analyzeRecipesForVegan = async (recipes) => {
  if (!recipes || recipes.length === 0) return [];

  const simplifiedList = recipes.map(r => ({
    id: r.idMeal,
    title: r.strMeal,
  }));

  try {
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      你是一個嚴格的素食分類員。請分析以下食譜清單。
      
      規則：
      1. vegan: 全素 (無蛋奶、無五辛)
      2. ovo: 蛋素
      3. lacto: 奶素
      4. five-pungent: 五辛素 (含蔥蒜)
      5. non-vegetarian: 含肉、海鮮或動物油脂

      輸入資料：
      ${JSON.stringify(simplifiedList)}

      請回傳一個 JSON Array，格式如下 (只回傳必要的欄位以節省 Token)：
      [
        { "id": "原始ID", "category": "vegan", "reason": "簡短理由", "tags": ["全素", "推薦"] }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);

  } catch (error) {
    // 🔥 優化錯誤處理：
    // 如果是 503 (Overloaded)，我們不拋出錯誤讓前端當機，而是只在 Console 記錄
    if (error.message.includes("503") || error.message.includes("Overloaded")) {
      console.warn("Gemini 伺服器忙碌中 (503)，暫時無法顯示素食標籤。");
    } else {
      console.error("前端素食分析失敗:", error);
    }
    
    // 回傳空陣列，這樣前端就會當作「未知」處理，不會白畫面
    return []; 
  }
}; */

// src/data/geminiService.jsx
// 移除 GoogleGenerativeAI

/* export const analyzeRecipesForVegan = async (recipes) => {
  if (!recipes || recipes.length === 0) return [];

  const simplifiedList = recipes.map(r => ({
    id: r.idMeal,
    title: r.strMeal,
  })); */

  /* try {
    // ✅ 改回呼叫後端 API
    const response = await fetch('/api/classify-vegan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipes: simplifiedList }),
    });

   if (!response.ok) {
       // 建議加這行：印出後端具體的錯誤訊息，除錯更方便
       const errorData = await response.text();
       console.error("Server Error Detail:", errorData);
       throw new Error(`API Error: ${response.status}`);
   }
    return await response.json();

  } catch (error) {
    console.error("Vegan Analysis API Failed:", error);
    return [];
  } */

    // ⚠️ 移除 try...catch，讓錯誤拋出給 App.jsx 處理
/*   const response = await fetch('/api/classify-vegan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipes: simplifiedList }),
  });

  if (!response.ok) {
     const errorText = await response.text();
     // 這裡拋出錯誤，App.jsx 的 catch 才會執行
     throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}; */
// services/geminiService.jsx
// services/geminiService.jsx

/**
 * 將食譜列表傳送到後端 API 進行素食分析
 * @param {Array} recipes - TheMealDB 的原始食譜陣列
 * @returns {Promise<Object>} - 包含 safeIds 的物件
 */
export const analyzeRecipesForVegan = async (recipes) => {
  try {
    // 假設你的 API 路徑是 /api/classify-vegan
    // 如果是 Vercel 本地開發，路徑通常是 http://localhost:3000/api/classify-vegan
    // 這裡使用相對路徑，讓 Vercel 自動處理
    const response = await fetch('/api/classify-vegan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipes }),
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data; // 預期回傳 { safeIds: [...] }

  } catch (error) {
    console.error("Gemini Service Error:", error);
    // 發生錯誤時，回傳空陣列或拋出錯誤，讓外層處理
    throw error;
  }
};