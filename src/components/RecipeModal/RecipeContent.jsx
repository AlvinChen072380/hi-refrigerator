import { useState } from "react";
import { useAiRecipe } from "../../hook/useAiRecipe";

export default function RecipeContent({ activeTab, meal }) {
  const [imgError, setImgError] = useState(false);
  const fallbackImage = "https://placehold.co/600x400?text=No+Image";

  const { aiRecipe, isAiLoading, aiError, generateAiRecipe } = useAiRecipe();
  const [showAiContent, setShowAiContent] = useState(false);

  return (
    <div className={`modal-left ${activeTab === "recipe" ? "active" : ""}`}>
      {/* 有AI資料就顯示中文，沒有就顯示原始英文資料 */}
      <h2>{aiRecipe && showAiContent ? aiRecipe.title_zh : meal.strMeal}</h2>

      {/* AI Tag */}
      {aiRecipe && (showAiContent || aiRecipe) && (
        <div
          className="tags-container"
          style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}
        >
          {aiRecipe.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: "#e0f2fe",
                color: "#0369a1",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "0.8rem",
              }}
            >
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

      <div className="ai-action-area" style={{ margin: "15px 0" }}>
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
          className="ai-btn"
          style={{
            background: aiRecipe && showAiContent
              ? "#64748b"
              : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            color: "white",
            border: "none",
            padding: "10px 20px",
          }}
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
          <p style={{ color: "#ef4444", fontSize: "0.9rem" }}>分析失敗: {aiError}</p>
        )}
      </div>

      {/* nutrition info AI */}
      {aiRecipe && showAiContent && aiRecipe.nutrition_estimate && (
        <div
          className="nutrition-box"
          style={{
            background: "#f8fafc",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            marginBottom: "20px",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#475569" }}>營養估算 (每份)</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#ea580c" }}>
                {aiRecipe.nutrition_estimate.calories}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>卡路里</div>
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0ea5e9" }}>
                {aiRecipe.nutrition_estimate.protein}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>蛋白質</div>
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#22c55e" }}>
                {aiRecipe.nutrition_estimate.carbon}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>碳水</div>
            </div>
          </div>
          <div style={{ marginTop: "10px", fontSize: "0.9rem", color: "#475569", display: "flex", gap: "15px" }}>
            <span>💡 難度: {aiRecipe.difficulty}</span>
            <span>⏱️ 時間: {aiRecipe.time_estimate}</span>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 10px 0" }}>
        {aiRecipe ? "料理步驟(Step by Step)" : "About Instructions:"}
      </h3>

      <div className="instructions-container">
        {aiRecipe && showAiContent ? (
          <div className="ai-steps">
            {aiRecipe.description_zh && (
              <p style={{ fontStyle: "italic", color: "#555", marginBottom: "15px", borderLeft: "4px solid #ddd", paddingLeft: "10px" }}>
                {aiRecipe.description_zh}
              </p>
            )}
            {aiRecipe.steps.map((step) => (
              <div key={step.step_number} style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
                <div style={{ background: "#f1f5f9", color: "#64748b", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }}>
                  {step.step_number}
                </div>
                <div>
                  {step.action_tag && (
                    <span style={{ background: "#ffedd5", color: "#ea580c", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", marginRight: "8px" }}>
                      {step.action_tag}
                    </span>
                  )}
                  <span style={{ lineHeight: "1.6" }}>{step.content}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="instructions">{meal.strInstructions}</p>
        )}
      </div>

      {meal.strYoutube && (
        <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="yt-link">
          📺 Learning on Youtube
        </a>
      )}
    </div>
  );
}
