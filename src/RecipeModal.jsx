import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SEO } from "./SEO";
import { Cross } from "./icons/Cross";
import { useAiRecipe } from "./hook/useAiRecipe";

// -- Helper Function: 食材資料格式轉換 --
const getIngredients = (meal) => {
  if (!meal) return [];

  let ingredients = [];
  //API 最多提供20種食材與份量，利用迴圈來取得
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    //如果食材欄位有值且不是空的，就加進陣列
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push({
        id: i, //先使用數字當作臨時ID
        text: ingredient,
        measure: measure,
        isCompleted: false, //購物清單預設未採買狀態
        isHidden: false, //預設不需要購買食材的隱藏
      });
    }
  }
  return ingredients;
};

// 1.meal: 詳細的食譜資料 (如果是 null 代表還在載入中)
// 2.onclose: 關閉視窗的函式
// 3.loading: 是否正在讀取詳細資料
function RecipeModal({ meal, onClose, loading }) {
  const [imgError, setImgError] = useState(false);
  const fallbackImage = "https://placehold.co/600x400?text=No+Image";
  //Add AI Hook
  const { aiRecipe, isAiLoading, aiError, generateAiRecipe } = useAiRecipe();

  const [showAiContent, setShowAiContent] = useState(false);

  const modalRef = useRef();

  const [activeTab, setActiveTab] = useState("recipe");

  const [ingredients, setIngredients] = useState(() => {
    // 直接在這裡做初始讀取，不用 useEffect 來 set
    if (!meal) return [];
    const saved = localStorage.getItem(`shopping-list-${meal.idMeal}`);
    return saved ? JSON.parse(saved) : getIngredients(meal);
  });

  // B:自動存檔機制
  // 只要ingredients 有任何更動，就自動存檔
  useEffect(() => {
    if (!meal) return;

    if (ingredients.length > 0) {
      localStorage.setItem(
        `shopping-list-${meal.idMeal}`,
        JSON.stringify(ingredients),
      );
    }
  }, [ingredients, meal]);

  //--- A:新增內部State ---

  //如果沒有資料且沒在載入，或者這個 Modal 根本不該顯示，就回傳 null (不渲染)

  //--- C: 互動函式:切換完成狀態(打勾/取消) ---
  const toggleIngredient = (id) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    );
  };

  //--- D: 互動函式:軟刪除(隱藏)食材清單功能 ---
  const archiveIngredient = (id) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isHidden: true,
            }
          : item,
      ),
    );
  };

  //--- E: 互動函式:復原所有隱藏項目 ---
  const restoreAll = () => {
    setIngredients((prev) =>
      prev.map((item) => (item.isHidden ? { ...item, isHidden: false } : item)),
    );
  };
  const hasHiddenItems = ingredients.some((item) => item.isHidden); //判斷是否有隱藏項目

  //--- F:互動函式:重置清單 ---
  const resetList = () => {
    if (window.confirm("Are you sure to reset? All record will be erased.")) {
      setIngredients(getIngredients(meal));
    }
  };

  // D:新增複製清單功能
  const copyToClipboard = () => {
    //1.過濾出 沒被刪除的食材
    const textToCopy = ingredients
      .filter((item) => !item.isHidden)
      .map((item) => {
        //2.格式化文字: [v] 雞蛋 (2顆)
        const check = item.isCompleted ? "[v]" : "[ ]";
        return `${check} ${item.text} (${item.measure})`;
      })
      .join("\n"); //換行
    //3.加上標題
    const finalContent = `${meal.strMeal} - 採買清單:\n\n${textToCopy}`;
    //4.寫入剪貼簿
    navigator.clipboard
      .writeText(finalContent)
      .then(() => alert("List is ready on clipboard"))
      .catch((err) => console.error("copy error", err));
  };

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

  return (
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
        <span className="close-btn" onClick={onClose}>
          <Cross />
        </span>

        <div className="modal-content">
          {/* -- 內容區 -- */}
          {loading ? (
            <div className="loading-state">
              <h3>Loading recipes...</h3>
            </div>
          ) : meal ? (
            <div className="modal-grid">

              { /* 手機版專用的切換按鈕 */ }
                <div className="mobile-tabs">
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
              <div
                className={`modal-left ${activeTab === "recipe" ? "active-content" : ""}`}
              >
                {/* 有AI資料就顯示中文，沒有就顯示原始英文資料 */}
                <h2>
                  {aiRecipe && showAiContent ? aiRecipe.title_zh : meal.strMeal}
                </h2>

               
                {/* AI Tag */}
                {aiRecipe && (showAiContent || aiRecipe) && (
                  <div className="tags-container">
                    {aiRecipe.tags.map((tag) => (
                      <span key={tag} className="ai-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <img
                  src={imgError ? fallbackImage : meal.strMealThumb}
                  alt={meal.strMeal}
                  onError={() => setImgError(true)}
                  loading="lazy"
                  className="modal-img"
                />
                <div className="ai-action-area">
                  <button
                    onClick={() => {
                      if (!aiRecipe) {
                        generateAiRecipe(meal);
                        setShowAiContent(true);
                      } else {
                        setShowAiContent(!showAiContent);
                      }
                    }}
                    disabled={isAiLoading}
                    className={`ai-btn ${showAiContent ? "active" : ""}`}
                  >
                    {isAiLoading ? (
                      <>
                        <span className="spinner"></span> AI 大廚正在分析食譜...
                      </>
                    ) : !aiRecipe ? (
                      <>✨呼叫 AI 翻譯並分析營養成分</>
                    ) : showAiContent ? (
                      <>↩️切換回原始英文食譜</>
                    ) : (
                      <>✨查看AI中文食譜</>
                    )}
                  </button>

                  {aiError && (
                    <p className="ai-error">⚠️ 分析失敗: {aiError}</p>
                  )}
                </div>
                {/* nutrition info AI */}
                {aiRecipe && showAiContent && aiRecipe.nutrition_estimate && (
                  <div className="nutrition-box">
                    <h4 className="nutrition-title">📊 營養估算 (每份)</h4>
                    <div className="nutrition-grid">
                      <div className="nutrition-item">
                        <div className="nutri-value val-cal">
                          {aiRecipe.nutrition_estimate.calories}
                        </div>
                        <div className="nutri-label">卡路里</div>
                      </div>
                      <div className="nutrition-item">
                        <div className="nutri-value val-pro">
                          {aiRecipe.nutrition_estimate.protein}
                        </div>
                        <div className="nutri-label">蛋白質</div>
                      </div>
                      <div className="nutrition-item">
                        <div className="nutri-value val-carb">
                          {aiRecipe.nutrition_estimate.carbon}
                        </div>
                        <div className="nutri-label">碳水</div>
                      </div>
                    </div>
                    <div className="nutrition-meta">
                      <span>💡 難度: {aiRecipe.difficulty}</span>
                      <span>⏱️ 時間: {aiRecipe.time_estimate}</span>
                    </div>
                  </div>
                )}
                <h3>
                  {aiRecipe ? "料理步驟(Step by Step)" : "About Instructions:"}
                </h3>
                {/* 讓文字區塊能依內容進行滾動 */}
                <div className="instructions-container">
                  {aiRecipe && showAiContent ? (
                    <div className="ai-steps">
                      {aiRecipe.description_zh && (
                        <p className="ai-desc">{aiRecipe.description_zh}</p>
                      )}
                      {aiRecipe.steps.map((step) => (
                        <div key={step.step_number} className="step-item">
                          <div className="step-number">{step.step_number}</div>
                          <div>
                            {step.action_tag && (
                              <span className="action-tag">
                                {step.action_tag}
                              </span>
                            )}
                            <span style={{ lineHeight: "1.6" }}>
                              {step.content}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="instructions">{meal.strInstructions}</p>
                  )}
                </div>
                {meal.strYoutube && (
                  <a
                    href={meal.strYoutube}
                    target="_blank"
                    rel="noreferrer"
                    className="yt-link"
                  >
                    📺 Learning on Youtube
                  </a>
                )}
              </div>
              {/* 右欄: 採買清單(新增功能) */}
              <div
                className={`modal-right ${activeTab === "ingredients" ? "active-content" : ""}`}
              >
                <h3>🛒 Ingredients List</h3>
                <p className="sub-text">check or delete</p>

                <ul className="ingredient-list">
                  {ingredients
                    .filter((item) => !item.isHidden) //只渲染 isHidden: false 的項目
                    .map((item) => (
                      <li
                        key={item.id}
                        className={item.isCompleted ? "completed" : ""}
                      >
                        {/* 1.點擊文字區塊切換打勾 */}
                        <div
                          className="ing-info"
                          onClick={() => toggleIngredient(item.id)}
                          role="checkbox"
                          aria-checked={item.isCompleted}
                          tabIndex={0}
                        >
                          <span className="custom-checkbox"></span>

                          <span className="list-item">
                            <strong>{item.text}</strong>
                            <span>({item.measure})</span>
                            {/* 2.刪除按鈕 */}
                          </span>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation(); //防止觸發打勾
                            archiveIngredient(item.id);
                          }}
                          title="Don't need this one"
                        >
                          🗑️
                        </button>
                      </li>
                    ))}
                </ul>
                {/* 恢復清單按鈕 */}
                <div className="action-buttons">
                  {hasHiddenItems && (
                    <button className="restore-btn" onClick={restoreAll}>
                      Reset deleted items
                    </button>
                  )}

                  {/* reset button */}
                  <button className="reset-btn" onClick={resetList}>
                    Reset list
                  </button>
                  <button className="copy-btn" onClick={copyToClipboard}>
                    Copy list
                  </button>

                  {/* {ingredients.length === 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#999",
                      marginTop: "20px",
                    }}
                  >
                    It's all done 🎉
                  </p>
                )} */}
                </div>
              </div>
            </div>
          ) : (
            <p className="error-text">發生錯誤，無法讀取資料</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;
