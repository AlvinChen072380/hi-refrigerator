import { useState, useEffect, useRef } from "react";
import "./index.css";
import RecipeModal from "./RecipeModal";
import { useRecipes } from "./hook/useRecipes";
import { useRecipeDetail } from "./hook/useRecipeDetail";
import { useTheme } from "./hook/useTheme";
import { SEO } from "./SEO";
import { MOCK_RECIPES } from "./data/mockRecipes";
import useVeganStore from "./store/useVeganStore";
import { getSmartSearchKeywords } from "./services/aiSearchService";
import { useVeganAI } from "./hook/useVeganAi.jsx";
import { usePageAnimations } from "./hook/usePageAnimations.jsx";
import TechStackModal from "./components/TechStackModal.jsx";
import NavBar from "./components/NavBar.jsx";
import HeroSearch from "./components/HeroSearch.jsx";
import StatusBoard from "./components/StatusBoard.jsx";
import RecipeList from "./components/RecipeList.jsx";

function App() { 
  
  /* const lastAnalyzedIdsRef = useRef(""); */ //紀錄上一次分析過的食譜ID組合，防止重複呼叫AI
  const {
    recipes,
    loading,
    error,
    hasSearched,
    searchTerm,
    handleInputChange,
    searchRecipes,
    resetSearch,
    warning,
  } = useRecipes();

  //Vegan model
  const { isVeganMode } = useVeganStore();
  //GSAP 1.定義動畫範圍(containerRef)
  const containerRef = useRef();
  
  const { theme, toggleTheme } = useTheme();

  //測試用MOCK data
  /*  const displayRecipes = isVeganMode
    ? MOCK_RECIPES.filter((item) => item.veganCategory !== "non-vegetarian")
    : recipes; */

  // 2. AI 邏輯層 phase 1 hook
  // 使用Custom Hook 取得AI分析狀態
  const { analyzedRecipes, isAnalyzing } = useVeganAI(recipes, isVeganMode);
  //計算最終要顯示的食譜列表 
  const currentDisplayRecipes = isVeganMode ? analyzedRecipes : recipes; 

  // 3. 動畫層 phase 2 hook
  usePageAnimations({
    containerRef,
    hasSearched,
    displayRecipes: currentDisplayRecipes,
    loading,
    isAnalyzing
  });

  //其他AI 相關state
  const [isSearching, setIsSearching] = useState(false); //控制搜尋讀取狀態
  const [aiSuggestion, setAiSuggestion] = useState(null); //儲存AI 查了什麼字
  const inputRef = useRef(null);

  const { 
    selectedId, 
    modalData, 
    isModalLoading, 
    handleShowDetails, 
    handleCloseModal 
  } = useRecipeDetail();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  //聚焦 Input
  useEffect(() => {
    if (searchTerm === "" && !hasSearched) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, hasSearched]);

  //模式切換時重置
  useEffect(() => {
    if (hasSearched || searchTerm) {
      setAiSuggestion(null);
      resetSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVeganMode]);

  // Smart Search Logic
  const handleSmartSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setIsSearching(true);
    setAiSuggestion(null);
    const isEnglishOnly = /^[\w\s\d\p{P}]+$/u.test(query);

    try {      
      let keywordToSearch = query;
      if (!isEnglishOnly) {
        const data = await getSmartSearchKeywords(query);
        keywordToSearch = data.english_keyword || query;

        if (
          data.english_keyword &&
          data.english_keyword.toLowerCase() !== query.toLowerCase()
        ) {
          setAiSuggestion(
            ` AI interpreted: "${query}" -> Searching for "${data.english_keyword}"`
          );
        }
      } 
      await searchRecipes(keywordToSearch);
    } catch (error) {
      console.error("Search failed", error);
      await searchRecipes(query);
    } finally {
      setIsSearching(false);
    }
  };

  //函式封裝 Wrapper中介函式
  const onInputChangeWrapper = (e) => {
    setAiSuggestion(null);
    handleInputChange(e);
  };
  const onResetWrapper = () => {
    setAiSuggestion(null);
    resetSearch();
  }; 



  return (
    <div ref={containerRef} className="app-container">
      <SEO />
      {/* 將整個App包在一個有 ref 的div裡 */}
      
           
            

      <NavBar 
        setIsInfoOpen={setIsInfoOpen} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <HeroSearch
        onResetWrapper={onResetWrapper}
        isVeganMode={isVeganMode}
        inputRef={inputRef}
        searchTerm={searchTerm}
        onInputChangeWrapper={onInputChangeWrapper}
        handleSmartSearch={handleSmartSearch}
        isSearching={isSearching}
        loading={loading}
        aiSuggestion={aiSuggestion}
      />
      <StatusBoard
        loading={loading}
        searchTerm={searchTerm}
        error={error}
        warning={warning}
        recipes={recipes}
        hasSearched={hasSearched}
        isVeganMode={isVeganMode}
        isAnalyzing={isAnalyzing}
        analyzedRecipes={analyzedRecipes}
      />

      <RecipeList
        loading={loading}
        error={error}
        isAnalyzing={isAnalyzing}
        currentDisplayRecipes={currentDisplayRecipes}
        handleShowDetails={handleShowDetails}
      />
      {/* -- 條件渲染 Modal -- */}
      {/* 只有當 selectedId 有值得時候，才把 Modal 畫出來 */}
      {selectedId &&
        modalData && ( //必須檢查 modalData 是否存在 預防非同不載入的null讀取錯誤
          <RecipeModal
            key={modalData.idMeal}
            meal={modalData}
            loading={isModalLoading}
            onClose={handleCloseModal}
          />
        )}
       
        <TechStackModal 
          isOpen={isInfoOpen} 
          onClose={() => setIsInfoOpen(false)} 
        />     
    </div>
  );
}

export default App;
