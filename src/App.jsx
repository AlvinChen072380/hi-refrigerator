import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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

function App() {
  //AI 相關state
  const [isSearching, setIsSearching] = useState(false); //控制搜尋讀取狀態
  const [aiSuggestion, setAiSuggestion] = useState(null); //儲存AI 查了什麼字  

  const inputRef = useRef(null);
  const isFirstRender = useRef(true); //初次渲染標記
  /* const lastAnalyzedIdsRef = useRef(""); */ //紀錄上一次分析過的食譜ID組合，防止重複呼叫AI

  const { theme, toggleTheme } = useTheme();

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

  //測試用MOCK data
  /*  const displayRecipes = isVeganMode
    ? MOCK_RECIPES.filter((item) => item.veganCategory !== "non-vegetarian")
    : recipes; */
  // 使用Custom Hook 取得AI分析狀態
  const { analyzedRecipes, isAnalyzing } = useVeganAI(recipes, isVeganMode);

  // -- Modal 相關狀態 --
  // 1.使用者目前點了哪個食譜 ID？ (null 代表沒點)
  const [selectedId, setSelectedId] = useState(null);
  // 2.詳細資料存放這裡
  const [modalData, setModalData] = useState(null);
  // 3. Modal 專用的載入狀態(避免跟外面的loading混淆)
  const [isModalLoading, setIsModalLoading] = useState(false);

  //GSAP 1.定義動畫範圍(containerRef)
  const containerRef = useRef();
  //GSAP 2.useGASP 開始動畫(intro)
  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.from("header h1", {
        y: -50,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.out",
      })
        .from(
          "header p",
          {
            y: 25,
            autoAlpha: 0,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          ".search-box",
          {
            scale: 0.8,
            autoAlpha: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.7"
        )
        .add(() => {
          gsap.set("header h1, header p, .search-box", {
            clearProps: "all",
          });
        });
    },
    { scope: containerRef }
  );

  //監聽hasSearched狀態來執行動畫
  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      if (hasSearched) {
        gsap.to(".hero-section", {
          minHeight: "180px",
          duration: 1.2,
          ease: "power3.inOut",
        });
        gsap.to("header h1", {
          scale: 0.8,
          /* marginBottom: "5px", */
          duration: 1.2,
          ease: "power3.inOut",
        });
      } else {
        gsap.to(".hero-section", {
          minHeight: "100dvh",
          duration: 0.8,
          ease: "power3.inOut",
        });
        gsap.to("header h1", {
          scale: 1,
          /* marginBottom: "10px", */
          /* marginTop: "40px", */
          duration: 0.9,
          ease: "power3.inOut",
        });
      }
    },
    { scope: containerRef, dependencies: [hasSearched] }
  );

  //搜尋結果顯示的動畫，recipe.card，觸發時機不同，分別做
  const currentDisplayRecipes = isVeganMode ? analyzedRecipes : recipes;

  useGSAP(
    () => {
      if (loading || isAnalyzing || currentDisplayRecipes.length === 0) return;      

      const cards = gsap.utils.toArray(".recipe-card");
      if (cards.length === 0) return;

      gsap.killTweensOf(".recipe-card");

      gsap.set(".recipe-card", { clearProps: "all" });

      gsap.fromTo(
        ".recipe-card",
        {
          y: 50,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "back.inOut(1.5)",
          onInterrupt: () => gsap.set(".recipe-card", { autoAlpha: 1 })
        }
      );
    },
    { 
      scope: containerRef, 
      dependencies: [currentDisplayRecipes, loading, isAnalyzing] 
    }
  );  

  // -- 核心邏輯:監聽 selectedId 的變化 --
  useEffect(() => {
    // 1.如果 selectedId 是 null，代表使用者關閉了視窗，什麼都不用作
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
    // 3.執行函式
    fetchDetails();
  }, [selectedId]); // <---只有當 selectedId 改變時，這裡才會執行

  // 當使用者點擊卡片上的按鈕
  const handleShowDetails = (id) => {
    /* console.log("你想查看 ID 為:", id, "的食譜詳情! (Step 7 處理)"); */
    setModalData(null); //先清空就資料，避免閃爍
    setSelectedId(id); //設定ID，會觸發上面的useEffect
  };

  // 關閉 Modal
  const handleCloseModal = () => {
    setSelectedId(null); // 把 ID 清空，Modal 就會消失
  };

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

  //模式切換的同時，清空畫面
  useEffect(() => {
    if (hasSearched || searchTerm) {
      resetSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVeganMode]);

  //智慧搜尋處理函式
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
      } else {
        /* console.log("偵測到純英文輸入，跳過 AI 翻譯，直接搜尋..."); */
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

  

  /*  const currentDisplayRecipes = isVeganMode ? analyzedRecipes : recipes; */

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
            {isSearching ? "AI..." : loading ? "Loading..." : "Search"}
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
