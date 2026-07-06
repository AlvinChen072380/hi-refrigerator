export default function ShoppingList({
  activeTab,
  ingredients,
  toggleIngredient,
  archiveIngredient,
  restoreAll,
  hasHiddenItems,
  resetList,
  copyToClipboard,
}) {
  return (
    <div className={`modal-right ${activeTab === "ingredients" ? "active-content" : ""}`}>
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
                  <span style={{ marginLeft: "4px" }}>({item.measure})</span>
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
      </div>
    </div>
  );
}
