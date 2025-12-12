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

function App() {
  const inputRef = useRef(null);
  const isFirstRender = useRef(true);//初次渲染標記

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
  } = useRecipes();

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
            clearProps: "all" });
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
          marginBottom: "5px",
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
          marginBottom: "10px",
          duration: 0.9,
          ease: "power3.inOut",
        });
      }
    },
    { scope: containerRef, dependencies: [hasSearched] }
  );

  //搜尋結果顯示的動畫，recipe.card，觸發時機不同，分別做
  useGSAP(
    () => {
      if (recipes.length > 0) {
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
          }
        );
      }
    },
    { scope: containerRef, dependencies: [recipes] }
  ); //***dependencies

  const handleSearch = async () => {
    searchRecipes(searchTerm);
  };

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

  return (
    <div ref={containerRef} className="app-container">
      <SEO />      
      {/* 將整個App包在一個有 ref 的div裡 */}
      <nav className="app-nav">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"          
          title={theme === "light" ? "Switch to Dark Mode" : " Switch to Light Mode"}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </nav>

      <div className="hero-section">
        <header>
          <h1
            onClick={resetSearch}            
            title="Back to Home"
          >
            Hi refrigerator!
          </h1>
          <p>What's in fridge? Let's find some recipes!</p>
        </header>

        <section className="search-box">
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g., egg, tomato, green..."
            className="search-input"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="search-btn"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </section>
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
        {error && (
          <p className="error-msg">
            ⚠️ Error: {error}
          </p>
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
      {/* 食譜列表區塊(只有在成功且有資料時才顯示 Grid) */}
      {/* 判斷:載入結束 AND 沒有錯誤 AND recipes 陣列裡有東西 */}
      {!loading && !error && recipes.length > 0 && (
        <section className="recipe-grid results-container">
          {/* 條件式渲染，確認recipes存在，且長度大於0 (短路求值)*/}
          {recipes.map((meal) => (
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
