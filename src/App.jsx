import { useState, useEffect, useRef } from "react";
import "./index.css";
import RecipeCard from "./RecipeCard";
import RecipeModal from "./RecipeModal";
import { useRecipes } from "./hook/useRecipes";
import { useTheme } from "./hook/useTheme";
import { SunIcon } from "./icons/SunIcon";
import { MoonIcon } from "./icons/MoonIcon";
import { SEO } from "./SEO";
import VeganToggle from "./components/VeganToggle";
import { MOCK_RECIPES } from "./data/mockRecipes";
import useVeganStore from "./store/useVeganStore";
import { getSmartSearchKeywords } from "./services/aiSearchService";
import Logo from "./components/Logo.jsx";
import { useVeganAI } from "./hook/useVeganAi.jsx";
import { usePageAnimations } from "./hook/usePageAnimations.jsx";

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

  // Modal 相關狀態   
  const [selectedId, setSelectedId] = useState(null);// 1.使用者目前點了哪個食譜 ID？ 
  const [modalData, setModalData] = useState(null);  // 2.詳細資料存放這裡  
  const [isModalLoading, setIsModalLoading] = useState(false);// 3. Modal 專用的載入狀態(避免跟外面的loading混淆)

  // -- 核心邏輯:Modal 資料抓取 --
  useEffect(() => {
    if (!selectedId) return;

    // 2.定義抓取詳情的函式
    const fetchDetails = async () => {
      setIsModalLoading(true); //Modal 開始輸入
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${selectedId}`
        );
        const data = await response.json();
        setModalData(data.meals[0]); //將拿到的第一筆資料存起來
        console.log(data);
      } catch (error) {
        console.error("無法取得詳細資料:", error);
      } finally {
        setIsModalLoading(false); // Modal 載入結束
      }
    };    
    fetchDetails();
  }, [selectedId]); // <---只有當 selectedId 改變時，這裡才會執行

  // 當使用者點擊卡片上的按鈕
  const handleShowDetails = (id) => {
    /* console.log("你想查看 ID 為:", id, "的食譜詳情! */
    setModalData(null); //先清空就資料，避免閃爍
    setSelectedId(id); //設定ID，會觸發上面的useEffect
  };

  // 關閉 Modal
  const handleCloseModal = () => {
    setSelectedId(null); // 把 ID 清空，Modal 就會消失
  };

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
      <nav className="app-nav">
        <div style={{ marginRight: "10px" }}>
          <VeganToggle />
        </div>

        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={
            theme === "light" ? "Switch to Dark Mode" : " Switch to Light Mode"
          }
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
      </nav>

      <div className="hero-section">
        <header>
          <div onClick={onResetWrapper} title="Back to Home">
           <Logo isVeganMode={isVeganMode} />
          </div>
          <p>What's in fridge? Let's find some recipes!</p>
        </header>

        <section className="search-box">
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g., 冰箱剩雞蛋, tomato..."
            className="search-input"
            value={searchTerm}
            onChange={onInputChangeWrapper}
            onKeyDown={(e) => e.key === "Enter" && handleSmartSearch(e)}
            disabled={isSearching}
          />
          <button
            className="search-btn"
            onClick={handleSmartSearch}
            disabled={loading || isSearching}
          >
            { isSearching ? "almost down..." : loading ? "Loading..." : isVeganMode ? "Vegetarian Search": "Search"}
          </button>
        </section>
        {/* 新增AI 翻譯提示條 */}
        {aiSuggestion && (
          <div
            style={{
              marginBottom: "20px",
              background: "rgba(255,255,255,0.9)",
              padding: "8px 12px",
              borderRadius: "20px",
              color: "#6366f1",
              fontSize: "0.9rem",
              fontWeight: "500",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              display: "inline-block",
              backdropFilter: "blur(5px)",
            }}
          >
            {aiSuggestion}
          </div>
        )}
      </div>
      {/* 狀態看板區塊 */}
      <section>
        {/* 2.載入中狀態(正在處理時顯示) */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">
              Finding recipes for **{searchTerm}**...
            </p>
          </div>
        )}

        {/* 1.錯誤狀態 */}
        {error && <p className="error-msg">⚠️ Error: {error}</p>}

        {/* fallbackSearch */}
        {warning && !loading && (
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #ffedd5",
              color: "#c2410c",
              padding: "10px 15px",
              borderRadius: "8px",
              margin: "15px 0",
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>💡</span>
            {warning}
          </div>
        )}

        {/* 3.查無結果狀態(只有在載入結束，且recipes為空陣列時才顯示) */}
        {!loading &&
          !error &&
          searchTerm &&
          recipes.length === 0 &&
          hasSearched && (
            <p className="error-text">
              Sorry, no recipes found for **{searchTerm}**.
            </p>
          )}
      </section> 

      {isVeganMode && isAnalyzing && !loading && hasSearched &&(
        <div
          className="analyzing-container"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <div className="chef-loading">           
            <span style={{ fontSize: "2rem" }}>🧑‍🍳</span>
          </div>
          <p style={{ color: "#666", marginTop: "10px" }}>
            AI Chef is checking ingredients for you... <br />
            <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
              (Filtering out meat & fish)
            </span>
          </p>
        </div>
      )}

      {/* 素食模式下原查詢食譜為0時才顯示此訊息 */}
      {!loading &&
        !isAnalyzing &&
        isVeganMode &&
        recipes.length > 0 &&
        analyzedRecipes.length === 0 && (
          <div className="error-text">
            <h3>No Options Found</h3>
            <p>AI filtered out recipes...</p>
          </div>
        )}

      {/* 食譜列表區塊(只有在成功且有資料時才顯示 Grid) */}
      {/* 判斷:載入結束 AND 沒有錯誤 AND recipes 陣列裡有東西 */}
      {!loading &&
        !error &&
        !isAnalyzing &&
        currentDisplayRecipes.length > 0 && (
          <section className="recipe-grid results-container">
            {/* 條件式渲染，確認recipes存在，且長度大於0 (短路求值)*/}
            {currentDisplayRecipes.map((meal) => (
              /* key=獨一無二的值!加在map裡的最外層 */
              <RecipeCard
                key={meal.idMeal} //key 必須留在map的的最外層
                meal={meal} //利用Props ! 傳遞資料
                handleShowDetails={handleShowDetails} //傳遞函式 讓子元件可以觸發父元件的邏輯
              />
            ))}
          </section>
        )}
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
    </div>
  );
}

export default App;
