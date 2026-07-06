# 專案重構計畫：API 穩定性優化與樣式模組化

## 問題分析：Gemini API 503 錯誤

目前的錯誤訊息為 `[503 Service Unavailable] This model is currently experiencing high demand.`，這是來自 Google Generative AI API 的伺服器端錯誤。
- **原因**：`gemini-2.5-flash-lite` 模型目前遇到高流量，導致暫時無法提供服務。這並非你的程式碼邏輯有誤，而是第三方服務的不可控狀況。
- **解決方向 (結合痛點四)**：
  1. **加入重試機制 (Retry)**：在 Vercel Serverless function (`api/enrich-recipe.js`) 遇到 503 時，自動等待 1~2 秒並重試。
  2. **強健的 JSON 解析**：針對回傳結果加入過濾 Markdown (例如 ````json ```` 區塊) 的邏輯，避免解析失敗。
  3. **友善的前端錯誤提示**：若重試後依然失敗，前端 UI 應該顯示「AI 服務忙碌中，請稍後再試」，而不是直接破圖或崩潰。

---

## Proposed Changes (重構計畫與方向)

### 階段一：API 穩定性與防呆機制 (解決 503 與痛點四)
#### [MODIFY] `api/enrich-recipe.js`
- 封裝 `generateContent`，加入自動重試機制 (Exponential Backoff)。
- 優化正則表達式，自動剝離可能包覆在 JSON 外層的 Markdown code blocks (` ```json ... ``` `)。

#### [MODIFY] `src/hook/useVeganAi.jsx` & `src/App.jsx`
- 在前端捕獲 500/503 錯誤時，提供友善的 Toast 或 UI 提示，告知使用者目前的 AI 狀態。

---

### 階段二：安全的樣式重構 (痛點二重新出發)
上一階段嘗試使用 Tailwind CSS 發生了預期外的狀況而退回。考慮到你有一千多行手寫的精緻 CSS (包含 GSAP 動畫對應的類別)，**「改用 CSS Modules」**是更為安全且符合你現狀的最佳策略！這可以解決全域污染的問題，又不需要完全重寫 CSS。

#### [NEW] `src/components/NavBar.module.css`, `src/components/RecipeList.module.css` 等
- 將 `index.css` 中的樣式，依據元件拆分到對應的 `.module.css` 中。
- 透過 `import styles from './NavBar.module.css'` 引入，並將 className 改為 `styles.xxx` 避免類別名稱衝突。

#### [MODIFY] `src/components/*.jsx` 及 `src/App.jsx`
- 替換所有元件的 className 指向對應的 CSS Modules 屬性。
- 保留全域共用的樣式 (如 `:root` 變數、`body` 基礎設定) 在 `index.css`。

---

### 階段三：API 請求邏輯分離 (痛點三)
#### [MODIFY] 待定 Custom Hooks / 引入 TanStack Query
- 把目前耦合在 Hook 中的資料獲取邏輯進一步優化。考慮引入 TanStack Query 來自動處理 cache、isLoading、isError 狀態。

---

## User Review Required

> [!IMPORTANT]
> **關於樣式重構的策略確認**
> 前次嘗試 Tailwind 失敗後退回，建議這次我們採用 **CSS Modules** 的方式。這種方式可以**100% 保留你原有的 CSS 設計 (包含動畫類別)**，只是把它們拆分並做到「區域化 (Local Scope)」，防止互相污染。
> 
> **請問你是否同意本次重構改用 CSS Modules 策略？還是依然希望挑戰引入 Tailwind CSS？**

## Verification Plan
1. **API 測試**：利用模擬錯誤測試 Serverless function 的 Retry 機制是否生效。
2. **樣式驗證**：套用 CSS Modules 後，使用瀏覽器檢查工具確認 class name 已自動加上 Hash (例如 `.NavBar_container__XYZ123`)，且沒有跑版。
