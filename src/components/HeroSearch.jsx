import Logo from "./Logo.jsx";

export default function HeroSearch({
  onResetWrapper,
  isVeganMode,
  inputRef,
  searchTerm,
  onInputChangeWrapper,
  handleSmartSearch,
  isSearching,
  loading,
  aiSuggestion,
}) {
  return (
    <div className="hero-section">
      <header>
        <div onClick={onResetWrapper} title="Back to Home">
          <Logo isVeganMode={isVeganMode} />
        </div>
        <p style={{ color: "var(--text-main)" }}>What's in fridge? Let's find some recipes!</p>
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
          {isSearching
            ? "AI Analyzing..."
            : loading
            ? "Loading..."
            : isVeganMode
            ? "Vegetarian Search"
            : "Search"}
        </button>
      </section>

      {/* AI 翻譯提示條 */}
      {aiSuggestion && (
        <div style={{
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
        }}>
          {aiSuggestion}
        </div>
      )}
    </div>
  );
}
