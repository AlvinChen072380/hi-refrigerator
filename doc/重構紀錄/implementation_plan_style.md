# 冰箱食譜 APP 第二階段重構計畫

提供先前重構的總結，並針對尚未完成的三個痛點（樣式混雜、Data Fetching、前端路由）擬定具體的執行計畫。

---

## ✅ 已完成項目標記 (Completed)

1. **[✅ 已解決] 全能型元件 (God Component)**
   - `App.jsx` 已成功瘦身，並建立 `src/components/` 與 `src/hook/` 實踐關注點分離。
2. **[✅ 已解決] AI JSON 解析的脆弱性**
   - 導入 Gemini `responseSchema` 與 Fallback 機制，解決了 Regex 解析不穩定的問題。
3. **[✅ 已解決] 缺少 UX 狀態回饋**
   - 加入了完整的 loading、isAnalyzing 狀態，並在畫面上給予明確的回饋。

---

## 🛠️ 未完成項目改案計畫 (Pending Refactoring)

接下來的重構將聚焦於**「可維護性」**與**「效能最佳化」**。

### 用戶回饋需求 (User Review Required)

> [!IMPORTANT]
> 關於「痛點二：樣式策略混雜」，這會影響到整個專案的撰寫習慣。目前我們有兩條路可以走，請你決定希望採取哪一種方案：
>
> **方案 A (推薦，學習成本適中)：導入 CSS Modules**
> - **作法**：不需要重寫現有的 1000 多行 CSS，只要把 `index.css` 拆分成各個元件專屬的 `.module.css` (例如 `HeroSearch.module.css`)。
> - **優點**：保留原生 CSS 撰寫習慣，同時解決全域 Class 污染的問題。
> 
> **方案 B (較花時間，但符合業界趨勢)：全面轉向 Tailwind CSS**
> - **作法**：安裝並設定 Tailwind，接著將 `index.css` 中的樣式全部對應轉換為 Tailwind Utility Classes 寫在 JSX 內，並刪除大部分原生 CSS。
> - **優點**：不用再想 className，寫法極度精簡，是目前業界最流行的做法。
>
> **請問你傾向選擇 方案 A 還是 方案 B？**

---

### 1. 導入 Data Fetching 庫 (解決痛點三)

目前 API 請求已經抽離到 Custom Hooks，但缺乏對「快取 (Cache)」和「競態條件」的管理。

#### Proposed Changes
- **安裝套件**：`npm install @tanstack/react-query`
- **初始化**：在 `main.jsx` 中包覆 `<QueryClientProvider>`。
- **重構 `useRecipes.js` 與 `useRecipeDetail.js`**：
  - 將原先使用 `useState` + `useEffect` 的 fetch 邏輯，改寫為 `useQuery`。
  - **預期效果**：關閉食譜 Modal 再打開同一個食譜時，不需要重新等待 API，畫面會瞬間出來（因為快取）。搜尋相同的關鍵字也能達到無縫載入。

### 2. 引入前端路由 React Router (架構升級)

目前點擊食譜開啟的是一個 `RecipeModal`，URL 始終是 `http://localhost:5173/`。如果想把某個食譜網址傳給朋友，朋友點開只會看到首頁。

#### Proposed Changes
- **安裝套件**：`npm install react-router-dom`
- **路由設計**：
  - `/` (首頁)：包含搜尋列與食譜列表。
  - `/recipe/:id` (食譜詳情頁)：當點擊卡片時，網址變化，並利用 `react-router` 開啟詳情。可以保留 Modal 的視覺效果（透過 React Router 的 state 背景渲染），或是將其獨立成一個完整的頁面。
- **修改元件**：`App.jsx` 將引入 `<BrowserRouter>` 與 `<Routes>`。

### 3. 樣式系統重構 (解決痛點二)

*將依據你在上方「用戶回饋需求」中所選擇的方案 (A 或 B) 來執行。*

---

## 執行順序建議

1. **Step 1:** 先導入 **React Query**，把 API 資料流穩固下來，因為這不影響畫面。
2. **Step 2:** 導入 **React Router**，確保食譜連結可以被獨立存取。
3. **Step 3:** 進行 **樣式 (CSS)** 的最終重構拆分。

---

請確認以上計畫，並告訴我你針對**樣式重構 (方案A 或 方案B)** 的選擇，我們就可以開始動工了！
