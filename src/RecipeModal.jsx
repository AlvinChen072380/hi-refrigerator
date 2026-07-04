import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { SEO } from "./SEO";
import { useGSAP } from "@gsap/react";
import { Cross } from "./icons/Cross";
import { useShoppingList } from "./hook/useShoppingList";
import ShoppingList from "./components/RecipeModal/ShoppingList";
import RecipeContent from "./components/RecipeModal/RecipeContent";

// 1.meal: 詳細的食譜資料 (如果是 null 代表還在載入中)
// 2.onclose: 關閉視窗的函式
// 3.loading: 是否正在讀取詳細資料
function RecipeModal({ meal, onClose, loading }) {

  const modalRef = useRef();

  const [activeTab, setActiveTab] = useState("recipe");

  // 當 Modal 打開時鎖定背景滾動
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const {
    ingredients,
    getIngredients,
    toggleIngredient,
    archiveIngredient,
    restoreAll,
    hasHiddenItems,
    resetList,
    copyToClipboard,
  } = useShoppingList(meal);

  useGSAP(
    () => {
      if (loading || !meal) return;

      const listEl = modalRef.current.querySelector(".ingredient-list");

      if (listEl) listEl.classList.remove("anim-done");

      //建立時間軸
      const tl = gsap.timeline({
        onComplete: () => {
          if (listEl) listEl.classList.add("anim-done");
        },
      });

      tl.from(".modal-content", {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      })
        .from(
          ".modal-left > *",
          {
            y: 20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            clearProps: "all",
          },
          "-=0.3",
        ) //時間重疊技巧:在動作一結束前0.3秒就開始跑，較緊湊
        .from(
          ".modal-right",
          {
            x: 20,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.4",
        )
        .from(
          ".ingredient-list li",
          {
            x: 20,
            opacity: 0,
            stagger: 0.05,
            duration: 0.3,
            clearProps: "all",
          },
          "-=0.2",
        );
    },
    { scope: modalRef, dependencies: [meal] },
  );

  return createPortal(
    <div ref={modalRef} className="modal" onClick={onClose}>
      {meal && (
        <SEO
          title={meal.strMeal}
          description={`Learn how to cook ${meal.strMeal}. Ingredients: ${getIngredients(
            meal,
          )
            .map((i) => i.text)
            .join(",")}...`}
          image={meal.strMealThumb}
        />
      )}
      {/* onClick={onClose} 綁在最外層，點擊灰色背景時也能關閉 */}
      {/* e.Propagation() **防止點擊內容區塊時誤觸發外層的關閉事件，
              阻止 capturing & bubbling的傳遞階段 */}
      <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <span
          className="close-btn"
          onClick={onClose}
        >
          <Cross />
        </span>

        <div className="modal-content">
          {/* -- 內容區 -- */}
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <h3>Loading recipes...</h3>
            </div>
          ) : meal ? (
            <div className="modal-grid">

              {/* 手機版專用的切換按鈕 — 桌面隱藏，手機顯示 */}
              <div className="flex md:hidden justify-center gap-[15px] py-5 border-b border-[--border-color] mb-5 bg-[--card-bg] w-full shrink-0" style={{ display: "none" }}>
                  <button
                    className={`tab-btn ${activeTab === "recipe" ? "active" : ""}`}
                    onClick={() => setActiveTab("recipe")}
                  >
                    查看食譜
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "ingredients" ? "active" : ""}`}
                    onClick={() => setActiveTab("ingredients")}
                  >
                    查看食材
                  </button>
                </div>

              {/*  /* 左欄:主要資訊與做法  */}
              <RecipeContent
                activeTab={activeTab}
                meal={meal}
              />

              {/* 右欄: 採買清單(新增功能) */}
              <ShoppingList
                activeTab={activeTab}
                ingredients={ingredients}
                toggleIngredient={toggleIngredient}
                archiveIngredient={archiveIngredient}
                restoreAll={restoreAll}
                hasHiddenItems={hasHiddenItems}
                resetList={resetList}
                copyToClipboard={copyToClipboard}
              />
            </div>
          ) : (
            <p style={{ textAlign: "center", padding: "20px" }}>發生錯誤，無法讀取資料</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default RecipeModal;
