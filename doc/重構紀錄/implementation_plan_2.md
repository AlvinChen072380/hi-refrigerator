# 痛點二：樣式策略混雜 (Mixed Styling) 重構計畫

## 1. 專案現狀分析
透過審視你的 `package.json` 與 `index.css`，我發現專案中雖然已經安裝了 `tailwindcss` (v4.1.18)，但絕大多數的樣式仍然以傳統的全域 CSS 寫在長達 1100 多行的 `index.css` 之中。

這會帶來兩個嚴重的軟體工程問題：
1. **全域污染 (Global Pollution)**：原生 CSS 的 Class Name 是全域的，未來專案擴大、元件增加時，極易發生命名衝突（例如兩個不同的元件都剛好用了 `.container`，導致樣式互相覆蓋）。
2. **套件冗餘與架構不清**：安裝了 Tailwind 卻不充分使用，這在面試官眼中代表對技術選型的掌控度不足。我們必須決定「唯一」的樣式策略。

## 2. 重構策略選擇 (Open Question)

> [!IMPORTANT]
> 身為資深前輩，我給你兩個前端業界主流的工程實踐選擇。請你仔細評估後，回覆我你想走哪一條路線，我們再開始動手：

### 選項 A：全面擁抱 Tailwind CSS (Utility-First)
- **具體做法**：將 `index.css` 中的自定義樣式，逐步替換成 Tailwind 的 Utility Classes（如 `className="flex flex-col items-center..."`）並寫在 React 元件中。`index.css` 最終只會保留基本的 Tailwind directive 與全域變數 (CSS Variables)。
- **工程優點**：不需再煩惱 Class 的命名（無須遵循 BEM 等規範），樣式與 HTML 結構高內聚 (High Cohesion)，且天然解決全域污染的問題。這也是目前 React 生態系中最主流的做法。

### 選項 B：改用 CSS Modules (Component-Scoped CSS)
- **具體做法**：移除 `tailwindcss` 依賴。將原本龐大的 `index.css`，依照元件拆分成如 `App.module.css`, `RecipeContent.module.css`，並在元件中以 `import styles from './App.module.css'` 的方式引入。
- **工程優點**：保留寫原生 CSS 的手感，但透過 Vite / Webpack 等打包工具，會在編譯時自動將 Class Name 加上 Hash 值（例如變成 `App_container_3f9a`），從物理上徹底解決全域污染的問題。

## 3. 約定的協作流程 (Antigravity 守則)

根據我們的《Antigravity 專案協作與重構守則》，一旦你選擇了上述其中一條路線，我們後續的修改將嚴格遵循以下五步循環：

1. **AI 執行示範 (Execution)**：我會先挑選一個特定區塊（例如 Header 或特定元件）進行小範圍的樣式重構。
2. **核心觀念解析 (Why & Impact)**：我會解釋這樣改的原理，以及對渲染或維護的影響。
3. **你的費曼輸出 (Your Explanation)**：你必須用精確的技術名詞，重新詮釋你對這步重構的理解。
4. **嚴格驗證 (AI Correction)**：我會不留情面地檢視你的觀念，有偏差就立即糾正。
5. **推進 (Proceed)**：觀念完全對齊後，我們才繼續重構下一個元件的樣式。

準備好的話，請告訴我你要選擇 **選項 A** 還是 **選項 B**！
