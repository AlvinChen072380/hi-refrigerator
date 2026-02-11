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
import { Info } from "lucide-react";
import Modal from "./components/Modal.js";

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

  const [isInfoOpen, setIsInfoOpen] = useState(false);

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
         {/* 新增 About 按鈕 */}  
          <div className="info-container">          
            <button
              onClick={() => setIsInfoOpen(true)}
              className="info-button"
              title="About Tech Stack"
            >
              <Info className="info-style"/>
            </button>
          </div>

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
       
        <Modal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="TECH STACK..."
        className="modal-title"
        maxWidth="xl"
      >
        <div className="modal-desc">
          <p className="first-desc">
            Welcome to <strong>Hi ! refrigerator</strong>, a conceptual recipe search website power by Gemini AI. It is built to demonstrate basic modern <strong>React + Vite </strong> development patterns.           
          </p>
          <ul className="modal-desc-ul">
            <li className="li-style-test">
              <h4>Core Infrastructure(核心架構搭建)</h4>
              <p>
                <strong>Vite</strong>:<br/>使用 Vite 建構高校開發環境，並利用內建的HMR(熱模組替換)提升效率，不用一直等重新整理。
              </p>
              <p>
                <strong>React 18</strong>:<br/>使用 Functional Component 建構模組化的SPA介面。
              </p>
              <p>
                <strong>JavaScript(ES6+)</strong>:<br/>運用 Async/Await 處理非同步邏輯，並使用 Map/Filter等陣列方法進行資料清洗與結構重整。
              </p>   
            </li>
            <li className="li-style-test"> 
              <h4>State & Logic(狀態管理)</h4>
              <p>
                <strong>React Hooks</strong>:<br/>靈活運用 useState 與 useEffect 來控制組件的生命週期與副作用，useRef 綁定 DOM 元素以整合 GSAP 動畫，避免觸發不必要的Re-render。
              </p>  
              <p>
                <strong>Custom Hooks</strong>:<br/>將商業邏輯(useRecipe)的API請求與資料邏輯抽離，實踐 Separation of Concerns，封裝(useTheme)深色模式的切換邏輯與持久化設定。
              </p>                 
              <p>
                <strong>LocalStorage</strong>:<br/>實作瀏覽器端的 資料持久化，確保使用者重新整理後，「購物清單」與「主題設定」能維持刷新前狀態。
              </p>    
               <p>
                <strong>Error Handling</strong>:<br/>使用 Try...catch 預先設置錯誤發生時的提示，同時搭配正則表達式進行輸入資料的核對，並實作 Loading狀態、處理邊界錯誤與查無資料時的UI回饋。
              </p>   
            </li>
            <li className="li-style-test">
              <h4>UI/UX & Styling(風格細節與介面體驗)</h4>
              <p>
                <strong>CSS3</strong>:<br/>建立語意化的 Design System 變數，以達成 Dark Mode 深色模式的切換，使用偽元素建立質感較佳的 Checkbox，取代傳統原生元件。 
              </p>
              <p>
                <strong>Modern Layout</strong>:<br/>結合 Flexbox 與 CSS Grid，製作能夠適應不同裝置尺寸的響應式排版，針對移動裝置優化，處理瀏海屏的 safe-area-inset 以及解決 Modal 滾動穿透與定位的問題。
              </p> 
              <p>
                <strong>GSAP</strong>:<br/>運用 TimeLine 製作開場與轉場動畫，使用 Stagger 效果製作搜尋結果的骨牌式進場。針對 React 生命週期，導入 useGSAP() 解決 React Strict Mode 下的動畫清理問題，並善用 clearProps 解決樣式殘留問題。在按鈕 Hover、 Focus 與 Modal 開關時使用 CSS Transition進行優化提升操作體驗。
              </p>              
            </li>
            <li className="li-style-test">
              <h4>AI Integration(AI 智慧功能導入與 API 整合)</h4>
              <p>
                <strong>TheMealDB API</strong>:<br/>串接外部公開資料庫，獲取標準化的食譜圖片與食材數據。
              </p>
              <p>
                <strong>Data Cleaning</strong>:<br/>透過撰寫 Helper Function 將TheMealDB資料庫回傳的資料進行標準化，(如 strIngredient1...20)轉換為乾淨的陣列結構。
              </p>
              <p>
                <strong>Google Gemini API</strong>:<br/>串接 gemini-2.0-flash 模型，利用生成式AI進行自然語言理解與食譜的邏輯判斷。<br />                
                <strong>Semantic Search(語意搜尋)</strong>:<br/> 將使用者的中文輸入或自然語言（如「我想吃雞肉料理」）轉換為標準化的英文食材關鍵字（如 chicken），以便查詢資料庫。<br />
                <strong>Dietary Analysis(飲食分析)</strong>:<br/> 分析食譜成分，判斷是否符合 Vegan (純素) 標準，並回傳 JSON 格式的分析報告。。
              </p>
              <p>
                <strong>RESTful API</strong>:<br/>使用 Fetch API 與 HTTP POST 方法，處理前端與AI模型及資料庫之間的資料傳輸。
              </p>   
              <p>
                <strong>Prompt Engineering</strong>:<br/>設定 System Instructions 與 AI 角色 (Persona)，並利用 JSON Mode 強制輸出標準化資料格式，確保前端渲染穩定性。
              </p>               
            </li>
            <li className="li-style-test">
              <h4>Optimization & DevOps(優化與部署)</h4>
              <p>
                <strong>Vercel Serverless Functions</strong>:<br/>透過Vercel的Serverless部署環境，建立 API Proxy 中間層，隱藏後端 API Key，解決 CORS 跨域問題並提升安全性。
              </p>
              <p>
                <strong>Environment Variables</strong>:<br/>透過使用 .env 檔案管理環境變數，確保敏感資訊不會暴露於前端程式碼中。
              </p>
              <p>
                <strong>PWA(Progressive Web App)</strong>:<br/>整合 vite-plugin-pwa 配置 Service Worker 與 Manifest 實現可安裝能力，打造類 Native APP 的體驗。
              </p>
              <p>
                <strong>SEO Optimization</strong>:<br/>使用 react-helmet-async 動態管理title、Meta標籤，確保每一頁食譜都有獨立的搜尋引擎描述與分享預覽。
              </p>
            </li>
                        
          </ul>
          <div className="modal-button-wrapper">
            <button
              onClick={() => setIsInfoOpen(false)}
              className="modal-button-style"
            >
              Got it!
            </button>
          </div>
        </div>
      </Modal>     
    </div>
  );
}

export default App;
