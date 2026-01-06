import { useCallback, useState } from "react";

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

    const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      
      if (value.trim() === ""){
      setRecipes([]);
      setHasSearched(false);
      setWarning(null);
      }
    };


   //定義搜尋函式，將fetch邏輯搬進來，新增可選參數(overrideTerm)
    const searchRecipes = async (overrideTerm = null) => {
      //判斷關鍵字使用
      const termToUse = (typeof overrideTerm === 'string' && overrideTerm)
                        ? overrideTerm
                        : searchTerm;

      //1.先檢查不為空
      if(!termToUse.trim()) {
        alert('請輸入食材名稱!');
        return;
      }
      //2.開始載入，重置錯誤
      setLoading(true);
      setError(null);
      setWarning(null);
      setRecipes([]); //清空上次結果
      setHasSearched(true);

      // API 錯誤處理 -加入 AbortController 設定 Timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
  
      try {
          //新增多重食材搜尋
          let apiUrl = "";

          const isMultiIngredient = termToUse.includes(',');

          if (isMultiIngredient) {
            apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${termToUse}`;
          } else { 
            apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${termToUse}`;
          }
          
          let response = await fetch(apiUrl, { signal: controller.signal });
          if (!response.ok) throw new Error("伺服器回應錯誤");
          let data = await response.json(); 

          if (!data.meals && isMultiIngredient) {
            const fallbackTerm = termToUse.split(',')[0].trim();

            console.log(`嚴格搜尋失敗，啟動降級搜尋: ${fallbackTerm}`);
            
            setWarning(`找不到同時包含 "${termToUse}"的食譜，以下是關於 "${fallbackTerm}"的搜尋結果。`);

            const fallbackUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${fallbackTerm}`;

            response = await fetch(fallbackUrl, { signal: controller.signal });
            if (!response.ok) throw new Error("伺服器回應錯誤");
            data = await response.json();  
          }
          //3.呼叫API searchTerm >替換成 termToUse
        /*   const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${termToUse}`,{ signal: controller.signal }
          ); */  

          setRecipes(data.meals || []);          
          setHasSearched(true);                  
          
      } catch (err) {
        if (err.name === "AbortError") {
          setError("請求逾時，請檢查網路連線或稍後在試。");
        } else {
          setError("連線失敗，請稍後在試")        
        }  
        console.error(err);    
      } finally {
        //5.無論成功或失敗，都結束載入狀態
        clearTimeout(timeoutId);
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