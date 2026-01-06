// src/services/aiSearchService.js
/* import { GoogleGenerativeAI } from "@google/generative-ai"; */

// 1. 取得 Key (前端版)
/* const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY); */

// 2. 定義直接執行的函式 (不再是 API Handler)
/* export const getSmartSearchKeywords = async (searchTerm) => {
  if (!searchTerm) return { english_keyword: searchTerm };

  console.log(`[Frontend AI] 正在翻譯: ${searchTerm}`); */

  /* try {
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are a culinary search assistant.
      User search: "${searchTerm}"
      
      Task:
      1. Identify *all* key food ingredients from the input.
      2. Translate them into English keywords used in TheMealDB.
      3. Format the output as a single string joined by commas (e.g., "chicken_breast,garlic").
      4. Use underscores (_) instead of spaces for multi-word ingredients.
      
      Expected Output Format (JSON only):
      {
        "original_input": "${searchTerm}",
        "english_keyword": "pork,apple"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

   
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonResponse = JSON.parse(text);

    console.log(`[Frontend AI] 翻譯成功: ${jsonResponse.english_keyword}`);
    return jsonResponse;

  } catch (error) {
    console.error("[Frontend AI] 翻譯失敗:", error);
   
    return { english_keyword: searchTerm };
  } */
 export const getSmartSearchKeywords = async (searchTerm) => {
  if (!searchTerm) return { english_keyword: searchTerm };

  try {
    // ✅ 改回呼叫後端 API
    const response = await fetch('/api/smart-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerm }),
    });

    if (!response.ok) throw new Error('API Error');

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Smart Search API Failed:", error);
    // 失敗時回退機制
    return { english_keyword: searchTerm }; 
  }
};