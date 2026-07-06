# 智慧搜尋載入狀態 (Loading UX) 修正計畫

解決 `doc/重構紀錄/project_review_note.md` 中提及的「痛點五：缺少 UX 狀態回饋 (Missing Loading State)」。

## 📌 問題背景與現況分析

當使用者輸入自然語言（例如：「冰箱剩番茄和雞蛋」）並點擊搜尋時，會觸發 `handleSmartSearch` 函式。這個函式會先呼叫 `/api/smart-search` 進行 AI 語意分析。
目前這個階段只有透過 `isSearching` 狀態讓搜尋按鈕顯示 `"almost down..."`，但下方的主要內容區塊 (StatusBoard) 完全沒有反應。如果使用者前一次搜尋的結果剛好是一個 emoji（如查無資料或素食廚師），畫面就會卡在那個固定的 emoji 長達數秒，導致嚴重的體驗割裂。

## 🛠️ 詳細修正流程與內容

### 1. 修正 `App.jsx` (狀態傳遞)
- **改動內容**：將 `App.jsx` 中現有的 `isSearching` 狀態，透過 props 往下傳遞給 `StatusBoard` 元件。
- **目的**：讓狀態面板 (StatusBoard) 知道目前正在進行 AI 語意分析，藉此決定是否要顯示對應的載入動畫。

### 2. 擴充 `StatusBoard.jsx` (新增 Loading UI)
- **改動內容**：在 `StatusBoard` 內增加針對 `isSearching === true` 的條件渲染區塊。
- **使用的技術**：利用已經存在於全域 CSS 中的 `.spinner` 與 `.loading-container` class。
- **實作邏輯**：
  ```jsx
  {isSearching && (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">
        AI 正在解讀您的食材...
      </p>
    </div>
  )}
  ```
- **目的**：讓使用者明確知道系統正在運作中，填補那 1~3 秒的視覺空白。

### 3. 優化 `HeroSearch.jsx` (按鈕文字修正)
- **改動內容**：目前的按鈕文字在 `isSearching` 時會顯示 `"almost down..."`（可能為 "almost done..." 的拼寫錯誤）。我們將其修正為更明確的 `"AI Analyzing..."` 或 `"處理中..."`。

## 💡 使用的技術與為什麼這樣做？

1. **條件渲染 (Conditional Rendering)**：
   - 使用 React 原生的 `&&` 語法來控制元件的顯示與隱藏。這是 React 中最標準且輕量的控制方式。
2. **重用 CSS Spinner (元件復用)**：
   - 不引入額外的動畫套件 (如 Lottie)，而是直接重用已經寫好且正在使用的 `.spinner` CSS 類別。這能保持應用程式的輕量化，且維持整體 UI 風格的一致性。
3. **優雅降級 (UX 心理學)**：
   - 透過顯示明確的「AI 正在解讀...」文字，能有效轉移使用者的注意力，降低等待時的焦慮感，這在需要等待外部 API (Gemini) 的全端應用中是必備的設計模式。

## ⚠️ User Review Required

請確認以上計畫是否符合您的期待？特別是 Loading 的文字提示（預設為「AI 正在解讀您的食材...」），如果您有其他偏好的文案，可以隨時告訴我。若確認無誤，我將立刻開始執行程式碼的修改！
