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

    const data = await response.json();
    return data; // 直接回傳後端處理好的 JSON

  } catch (error) {
    console.error("Enrich Service Error:", error);
    throw error;
  }
};