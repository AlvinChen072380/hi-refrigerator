import { useState } from "react";

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

    const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      
      if (value.trim() === ""){
      setRecipes([]);
      setHasSearched(false);
      }
    };


   //定義搜尋函式，將fetch邏輯搬進來
    const searchRecipes = async () => {
      //1.先檢查不為空
      if(!searchTerm.trim()) {
        alert('請輸入食材名稱!');
        return;
      }
      //2.開始載入，重置錯誤
      setLoading(true);
      setError(null);
      setRecipes([]); //清空上次結果
      setHasSearched(true);

      // API 錯誤處理 -加入 AbortController 設定 Timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
  
      try {
          //3.呼叫API
          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`,{ signal: controller.signal }
          );
          if (!response.ok) throw new Error("伺服器回應錯誤");

          const data = await response.json();       
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

    const resetSearch = () => {
      setSearchTerm("");
      setRecipes([]);
      setHasSearched(false);
    }

    return {
      recipes,
      loading,
      error,
      hasSearched,
      searchTerm,

      searchRecipes,
      handleInputChange,
      resetSearch
    };
}