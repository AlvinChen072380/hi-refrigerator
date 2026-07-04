# 重構計畫：拆解全能型元件 (App.jsx)

這份計畫的目標是解決「痛點一：全能型元件」。目前 `App.jsx` 檔案長達 468 行，承載了太多不相關的責任。這使得程式碼不僅難以閱讀，未來若要新增功能也容易改A壞B。

我們將採用**「由外而內，先易後難」**的策略，逐步將 `App.jsx` 拆分成更小、更專注的元件 (Components)。

## 🎯 預期目標與未來影響

- **提升可讀性**：`App.jsx` 的行數預計將從 468 行縮減至 150 行以內。
- **單一職責原則 (SRP)**：每個元件只專注做好一件事（例如：`NavBar` 只管導覽列，`TechStackModal` 只管顯示技術介紹）。
- **未來擴充性**：之後如果要修改搜尋框的樣式，你只需要打開 `HeroSearch.jsx`，不必再到包含幾百行無關邏輯的 `App.jsx` 裡海底撈針。

---

## Proposed Changes (預計修改範圍)

我們將分三個階段進行拆解。建議我們**一個階段一個階段來做**，這樣你比較好吸收。

### 第一階段：抽離純顯示的靜態區塊
`App.jsx` 最底部有一個 `<Modal title="TECH STACK...">` 包含了大量的文字與列表（約 100 行），這完全是靜態內容，最適合第一波抽離。

#### [NEW] `src/components/TechStackModal.jsx`
- **目的 (Why)**：將關於技術堆疊說明的 100 多行 HTML/JSX 搬移到這裡。
- **做法**：建立這個新檔案，接收 `isOpen` 和 `onClose` 兩個 Props，將原本在 `App.jsx` 裡面的內容完整移過來。

#### [MODIFY] `src/App.jsx`
- **目的 (Why)**：將肥大的 `<Modal>` 區塊刪除，替換成短短一行的 `<TechStackModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />`。

---

### 第二階段：抽離導覽列 (Navigation Bar)
`App.jsx` 上方包含了「關於按鈕」、「素食切換」、「深色模式切換」。

#### [NEW] `src/components/NavBar.jsx`
- **目的 (Why)**：將右上角的控制選項打包在一起，形成一個獨立的模組。
- **作法**：接收 `setIsInfoOpen`、`theme`、`toggleTheme` 等 Props，將 `<nav className="app-nav">...</nav>` 移入其中。

#### [MODIFY] `src/App.jsx`
- **目的 (Why)**：清理掉 UI 頂部的宣告，改用 `<NavBar />` 引入。

---

### 第三階段：抽離搜尋與 Hero 區塊
這是 `App.jsx` 的核心 UI，包含了大標題、Logo 以及搜尋框。

#### [NEW] `src/components/HeroSearch.jsx`
- **目的 (Why)**：將搜尋列的 UI (`<section className="search-box">` 與 AI 提示條) 封裝起來。
- **作法**：接收 `searchTerm`, `onInputChangeWrapper`, `handleSmartSearch`, `isSearching`, `loading`, `isVeganMode`, `aiSuggestion` 等狀態與函式作為 Props。

#### [MODIFY] `src/App.jsx`
- **目的 (Why)**：讓 `App.jsx` 徹底蛻變成一個「容器 (Container)」，只負責管理資料流 (Data Flow) 與判斷要顯示什麼，不再負責具體的 HTML 排版。

---

## User Review Required

> [!IMPORTANT]
> **請審閱此重構計畫**
> 
> 為了確保你能清楚理解每一步，我建議我們**先只執行第一階段（抽離 TechStackModal）**。
> 1. 第一階段最簡單，且不會影響複雜的狀態流動。
> 2. 做完第一階段後，我會解釋程式碼變化的意義，我們再決定是否進入第二階段。
>
> **如果你同意這個計畫，請回覆「同意」，我們馬上開始第一階段的重構！**
