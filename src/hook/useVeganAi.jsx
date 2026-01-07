import { useState, useEffect } from "react";
import { analyzeRecipesForVegan } from "../services/geminiService";


/**
 * useVeganAI Hook
 * 負責處理素食過濾的邏輯與狀態管理
 * @param {Array} recipes - 目前搜尋到的原始食譜列表
 * @param {Boolean} isVeganMode - 是否開啟素食模式
 * @returns {Object} { analyzedRecipes, isAnalyzing }
 */

export function useVeganAI(recipes, isVeganMode) {
  const [analyzedRecipes, setAnalyzedRecipes] = useState([]); //存放AI分析素食類結果
  const [isAnalyzing, setIsAnalyzing] = useState(false); //AI思考中狀態

  // --- 請替換 App.jsx 中的 doAnalysis ---
  useEffect(() => {
    let isMounted = true;

    /* if (recipes.length === 0) {
      lastAnalyzedIdsRef.current = "";
      setAnalyzedRecipes([]);
      return;
    } */

    const doAnalysis = async () => {
      // 1. 如果沒開模式或沒資料，重置並離開
      if (!isVeganMode || recipes.length === 0) {
        setAnalyzedRecipes([]);
        return;
      }

      // 檢查是否跟上次一樣，避免重複呼叫
     /*  const currentIds = recipes.map((r) => r.idMeal).join(","); */
      //檢查快取
      /* if (lastAnalyzedIdsRef.current === currentIds) { */
        // 🔥 重要修正：即使 ID 一樣，我們也要確保 analyzedRecipes 有資料！
         // 因為 React 重新渲染後，analyzedRecipes 可能被重置了。
         // 這裡有兩個選擇：
         // A. 簡單版：直接讓它往下跑，重 call 一次 AI (反正 Flash-lite 很便宜) -> 推薦這個，比較穩
         // B. 省錢版：你需要另外用一個 useRef 把 "上一次的 safeIds" 存起來，這裡直接 setAnalyzedRecipes(cachedSafeIds)
         
         // 為了避免複雜度，我們選擇 "移除這個 return check"，或者 "僅在 analyzedRecipes 有值時才 return"
      /*   if (analyzedRecipes.length > 0) return;
      }   */      
       
      /* lastAnalyzedIdsRef.current = currentIds; */
      setIsAnalyzing(true);

      try {
        // 2. 呼叫後端
        const response = await analyzeRecipesForVegan(recipes);
        // 假設你的 service 會回傳 data，這裡預期 data 結構是 { safeIds: [...] }
        // 注意：如果你原本的 analyzeRecipesForVegan 直接回傳 array，請依情況調整
        // 這裡假設 analyzeRecipesForVegan 回傳的是 fetch().json() 的結果

        // 為了安全，我們這裡做個檢查，如果回傳的是陣列(舊版)或物件(新版)
        let safeIds = [];
        if (Array.isArray(response)) {
          // 相容舊版回傳 [{id:..., isVegan: true}]
          safeIds = response.filter((r) => r.isVegan).map((r) => String(r.id));
        } else if (response && response.safeIds) {
          // 新版回傳 { safeIds: ["1", "2"] }
          safeIds = response.safeIds.map((id) => String(id));
        }

        console.log("AI Approved IDs:", safeIds);

        if (isMounted) {
          // 3. 過濾：只留下 ID 在 safeIds 裡面的食譜
          const filtered = recipes.filter((recipe) =>
            safeIds.includes(String(recipe.idMeal))
          );
          setAnalyzedRecipes(filtered);
        }
      } catch (err) {
        console.error("AI Mode Failed, using Local Filter:", err);

        // --- 4. 寬鬆的保底過濾 (Fix: 讓 Apple Cake 活下來) ---
        if (isMounted) {
          /* const fallbackList = recipes.filter((recipe) => {
            const cat = (recipe.strCategory || "").toLowerCase();
            const title = (recipe.strMeal || "").toLowerCase();
 */
            // 黑名單 (絕對不行的)
            /* const forbidden = [
              "pork",
              "beef",
              "chicken",
              "lamb",
              "meat",
              "fish",
              "seafood",
              "ham",
              "bacon",
            ];
            if (
              forbidden.some(
                (word) => cat.includes(word) || title.includes(word)
              )
            ) {
              return false;
            } */

            // 白名單 (原本因為分類不是 Vegetarian 而被殺掉的，現在放行)
            // 甜點、義大利麵、配菜、早餐、素食
            /* const safeCategories = [
              "vegetarian",
              "vegan",
              "dessert",
              "pasta",
              "side",
              "starter",
              "breakfast",
            ];
            if (safeCategories.includes(cat)) {
              return true;
            } */

            // 如果是其他分類 (例如 Miscellaneous)，只要標題沒肉，預設給過
            /* return true; */
          /* }); */
          setAnalyzedRecipes(/* fallbackList */[]);
        }
      } finally {
        if (isMounted) setIsAnalyzing(false);
      }
    };

    doAnalysis();

    return () => {
      isMounted = false;
    };
  }, [recipes, isVeganMode]);

    return {
    analyzedRecipes,
    isAnalyzing
  };
}

