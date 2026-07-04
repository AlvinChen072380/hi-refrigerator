// src/services/enrichService.jsx

export const generateAiRecipeDetails = async (recipeData) => {
  try {
    // 改打自己的後端 API
    const response = await fetch('/api/enrich-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // 傳送後端需要的資料
        recipeData: recipeData,
       /*  ingredients: recipeData.ingredientLines */
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const rawData = await response.json();
    
    // 實作 Adapter Pattern：將後端節省 Token 的精簡格式，還原成前端原本期望的格式
    const adaptedData = {
      id: recipeData.idMeal, // 前端本來就有 ID，直接從原本的資料拿
      title_en: recipeData.strMeal, // 前端本來就有英文標題
      title_zh: rawData.title,
      description_zh: rawData.desc,
      difficulty: rawData.diff,
      time_estimate: rawData.time,
      tags: rawData.tags,
      nutrition_estimate: {
        calories: rawData.nutr?.cal,
        protein: rawData.nutr?.pro,
        carbon: rawData.nutr?.car
      },
      ingredients: rawData.ing?.map(item => ({
        item: item.i,
        amount: item.a,
        original_text: "" // AI 不再回傳這包垃圾資料，若後續 UI 真的需要可以從 recipeData 中找出對應字串
      })),
      steps: rawData.steps?.map((step, index) => ({
        step_number: index + 1, // 直接用迴圈 index 推算步驟
        content: step.txt,
        action_tag: step.act
      }))
    };

    return adaptedData;

  } catch (error) {
    console.error("Enrich Service Error:", error);
    throw error;
  }
};