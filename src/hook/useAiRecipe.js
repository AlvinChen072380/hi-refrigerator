import { useState } from "react";
import { generateAiRecipeDetails } from "../services/enrichService";

export function useAiRecipe() {
  const [aiRecipe, setAiRecipe] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const generateAiRecipe = async (rawRecipeData) => {
    setIsAiLoading(true);
    setAiError(null);
    setAiRecipe(null);

    try {
      //call Serverless Function
      /* const response = await fetch('/api/enrich-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeData: rawRecipeData }),
      });

      if (!response.ok) {
        throw new Error('AI 服務暫時無法使用')
      } */

      /* const data = await response.json(); */
      const data = await generateAiRecipeDetails(rawRecipeData);
      setAiRecipe(data);

    } catch (err) {
      console.error(err);
      setAiError(err.message || "AI服務暫時無法使用");
    } finally {
      setIsAiLoading(false);
    }
  };

  return { aiRecipe, isAiLoading, aiError, generateAiRecipe };
}