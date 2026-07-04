import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const searchSchema = {
  type: SchemaType.OBJECT,
  properties: {
    original_input: { type: SchemaType.STRING },
    english_keyword: { type: SchemaType.STRING, description: "Ingredients translated to English, joined by commas. Use underscores for multi-word ingredients." },
    is_multiple: { type: SchemaType.BOOLEAN }
  },
  required: ["original_input", "english_keyword", "is_multiple"]
};

export default async function handler(req, res) {
  // 1. 設定 CORS (允許跨域請求)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. 處理預檢請求 (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. 限制只接受 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 【修正點 1】：從 req.body 取得 searchTerm (搜尋關鍵字)，而不是 recipes
    const { searchTerm } = req.body; 

    // 防呆機制：如果沒傳關鍵字
    if (!searchTerm) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: searchSchema
      }
    });
    
    // 【修正點 2】：Prompt 中的變數必須與上方定義的 const { searchTerm } 一致
    const prompt = `
      You are a culinary search assistant.
      The user will provide a sentence or ingredients in Traditional Chinese.
      
      Your Goal:
      1. Identify *all* key food ingredients from the input.
      2. Translate them into English keywords.
      3. Format the output as a single string joined by commas (e.g., "chicken_breast,garlic").
      4. Use underscores (_) instead of spaces for multi-word ingredients.

      User Input: "${searchTerm}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 設定 responseSchema 後，必定回傳合法 JSON，無需 Regex
    const analysisResult = JSON.parse(responseText);

    return res.status(200).json(analysisResult);

  } catch (error) {
    console.error('Smart Search API Error:', error);
    return res.status(500).json({ error: '搜尋分析失敗', details: error.message });
  }
}