export default function StatusBoard({
  loading,
  searchTerm,
  error,
  warning,
  recipes,
  hasSearched,
  isVeganMode,
  isAnalyzing,
  analyzedRecipes,
  isSearching,
}) {
  // 0. AI 智慧搜尋中狀態 (最優先顯示，蓋掉前一次搜尋的舊狀態)
  if (isSearching) {
    return (
      <section>
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">
            AI 正在解讀您的食材...
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
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

        {/* fallbackSearch warning */}
        {warning && !loading && (
          <div style={{
            background: "var(--bg-color-tech)",
            border: "1px solid var(--border-color)",
            color: "var(--primary-hover)",
            padding: "10px 15px",
            borderRadius: "8px",
            margin: "15px 20px",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span>💡</span>
            {warning}
          </div>
        )}

        {/* 3.查無結果狀態 */}
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

      {/* 素食模式分析中 */}
      {isVeganMode && isAnalyzing && !loading && hasSearched && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">
            AI Chef is checking ingredients for you... <br />
            <span style={{ fontSize: "0.85rem", opacity: 0.8, fontWeight: "normal" }}>
              (Filtering out meat & fish)
            </span>
          </p>
        </div>
      )}

      {/* 素食模式下過濾後為0 */}
      {!loading &&
        !isAnalyzing &&
        isVeganMode &&
        recipes.length > 0 &&
        analyzedRecipes.length === 0 && (
          <div className="error-text" style={{ flexDirection: "column" }}>
            <h3 style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: "8px" }}>No Options Found</h3>
            <p>AI filtered out recipes...</p>
          </div>
        )}
    </>
  );
}
