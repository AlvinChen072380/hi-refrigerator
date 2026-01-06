/* eslint-env node */
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // --- CORS 設定 ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { recipes } = req.body;
    if (!recipes || !Array.isArray(recipes)) {
      return res.status(400).json({ error: 'No recipes provided' });
    }

    // 1. 資料清洗：更聰明的處理 "沒有成分" 的情況
    const simplifiedRecipes = recipes.map(r => {
      let ingredients = [];
      
      // 嘗試抓取成分
      for (let i = 1; i <= 20; i++) {
        const key = `strIngredient${i}`;
        const val = r[key];
        if (val && val.trim()) {
          ingredients.push(val);
        }
      }

      // 如果成分是空的 (因為 filter.php 沒回傳)，標記給 AI 知道
      const ingredientText = ingredients.length > 0 
        ? ingredients.join(", ") 
        : "Ingredients data missing from API. Please judge based on Title and Category only.";

      return {
        id: r.idMeal,
        title: r.strMeal,
        category: r.strCategory || "Unknown", 
        ingredients: ingredientText
      };
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite", 
      generationConfig: { 
        responseMimeType: "application/json" // 強制回傳 JSON
      }
    });

    // 2. Prompt 優化：給予 AI 更明確的權限去判斷 "缺少成分" 的食譜
    const prompt = `
      You are a Strict Vegan Filter. Analyze the provided recipes and identify which ones are Vegan-friendly.

      Strict Rules:
      1. ❌ EXCLUDE: Beef, Pork, Chicken, Lamb, Seafood, Fish, Bacon, Ham, Sausage, Gelatin, Lard, Meat Stock, Fish Sauce, Oyster Sauce.
      2. ✅ INCLUDE: Eggs, Milk, Cheese, Butter, Cream, Honey (Assume Lacto-Ovo Vegetarian/Vegan friendly context for now, or strictly Vegan depending on user request, but let's be "Vegetarian Safe" first). 
      *Correction*: The user asked for "Vegetarian" (全素). So: ❌ NO MEAT
      
      Important Handling for Missing Data:
      - If 'ingredients' says "data missing", use your common sense based on the 'title' and 'category'. 
      - Example: "Beef Wellington" -> Unsafe. "Avocado Salad" -> Safe.
      - If unsure, err on the side of caution (exclude it).

      Input Data: 
      ${JSON.stringify(simplifiedRecipes)}

      Output Requirement:
      Return a JSON Object with a single key "safeIds" containing an array of ID strings.
      Example: { "safeIds": ["52772", "53380"] }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("AI Raw Output:", responseText); 

    // 3. 解析 JSON (直接 parse，因為設定了 responseMimeType)
    let parsedData;
    try {
        parsedData = JSON.parse(responseText);
    } catch (e) {
        // 保底 Regex 解析，以防萬一
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("Invalid JSON format from AI");
        }
    }

    // 確保回傳格式正確
    const safeIds = parsedData.safeIds || [];

    return res.status(200).json({ safeIds });

  } catch (error) {
    console.error('Vegan Analysis Error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}