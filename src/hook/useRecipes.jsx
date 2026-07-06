import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRecipes() {
  //搜尋內容的State放這裡
  const [searchTerm, setSearchTerm] = useState('');
  //API回傳食譜的State
  const [recipes, setRecipes] = useState([]);
  //紀錄向API索取資料的State (Boolean)
  const [loading, setLoading] = useState(false);
  //儲存錯誤訊息的State
  const [error, setError] = useState(null);
  //搜尋與未搜尋過的，改變顯示狀態字幕
  const [hasSearched, setHasSearched] = useState(false);
  //fallback search
  const [warning, setWarning] = useState(null);
  
  const queryClient = useQueryClient();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === ""){
      setRecipes([]);
      setHasSearched(false);
      setWarning(null);
    }
  };

  //定義搜尋函式，使用 React Query 的 fetchQuery 來享用快取機制
  const searchRecipes = async (overrideTerm = null) => {
    const termToUse = (typeof overrideTerm === 'string' && overrideTerm)
                      ? overrideTerm
                      : searchTerm;

    if(!termToUse.trim()) {
      alert('請輸入食材名稱!');
      return;
    }

    setLoading(true);
    setError(null);
    setWarning(null);
    setRecipes([]); 
    setHasSearched(true);

    try {
      // 透過 fetchQuery 發送請求，如果曾經搜尋過同一組關鍵字，會直接命中快取(0秒回傳)
      const data = await queryClient.fetchQuery({
        queryKey: ['searchRecipes', termToUse],
        queryFn: async () => {
          const isMultiIngredient = termToUse.includes(',');
          let apiUrl = isMultiIngredient
            ? `https://www.themealdb.com/api/json/v1/1/filter.php?i=${termToUse}`
            : `https://www.themealdb.com/api/json/v1/1/search.php?s=${termToUse}`;
            
          let response = await fetch(apiUrl);
          if (!response.ok) throw new Error("伺服器回應錯誤");
          let result = await response.json(); 

          let warningMsg = null;
          if (!result.meals && isMultiIngredient) {
            const fallbackTerm = termToUse.split(',')[0].trim();
            warningMsg = `找不到同時包含 "${termToUse}"的食譜，以下是關於 "${fallbackTerm}"的搜尋結果。`;
            const fallbackUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${fallbackTerm}`;
            response = await fetch(fallbackUrl);
            if (!response.ok) throw new Error("伺服器回應錯誤");
            result = await response.json();  
          }
          return { meals: result.meals || [], warningMsg };
        },
        staleTime: 1000 * 60 * 5, // 快取 5 分鐘
      });

      setRecipes(data.meals);          
      setWarning(data.warningMsg);
      setHasSearched(true);                  
        
    } catch (err) {
      setError("連線失敗，請稍後在試");        
      console.error(err);    
    } finally {
      setLoading(false);       
    }
  };  

  const resetSearch = useCallback(() => {
    setSearchTerm("");
    setRecipes([]);
    setHasSearched(false);
    setWarning(null);
  },[]);

  return {
    recipes,
    loading,
    error,
    hasSearched,
    searchTerm,
    warning,
    searchRecipes,
    handleInputChange,
    resetSearch,
    setRecipes
  };
}