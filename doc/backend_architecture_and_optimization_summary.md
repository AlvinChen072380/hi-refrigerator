# 🚀 後端架構演進與系統優化總結 (Backend Architecture & Optimization Summary)

這份文件系統性地梳理了 `hi-refrigerator` 專案在 Serverless API、快取機制、AI Token 優化以及實務除錯上的核心進展。這些實務經驗涵蓋了現代全端開發的關鍵痛點與最佳實踐。

---

## 一、 API 韌性設計 (API Resilience)

為了解決第三方 AI 服務不穩定的問題（如 503 Server Error 或 Rate Limit），我們導入了容錯機制：
1. **重試機制 (Retry Pattern)**：利用 `while` 迴圈與 `try...catch`，在遇到網路錯誤時暫停 1 秒後自動重試，最多重試 2 次。
2. **模型降級備援 (Model Fallback)**：當主模型 (`gemini-3.1-flash-lite`) 嚴重塞車失效時，系統會自動在重試時切換到備援模型 (`gemini-2.5-flash`)，確保系統「不輕易報錯」。

---

## 二、 資料庫快取架構 (Cache-Aside Pattern)

為了解決「重複翻譯同一份食譜」導致的延遲（10 秒）與 Token 浪費，我們導入了 Redis (Upstash) 作為記憶體快取：
1. **快取生命週期**：
   - **Cache Hit (命中)**：先查 Redis，若有資料則在 0.1 秒內直接回傳，略過 AI。
   - **Cache Miss (未命中)**：若無資料，則呼叫 AI 翻譯，拿到結果後 `kv.set` 寫入 Redis 造福下一位使用者。
2. **快取命名空間 (Namespace)**：使用 `recipe:ai:v2:{id}` 的格式。`v2` 代表快取的結構版本，當未來 JSON 結構大改時，只需改為 `v3` 就能瞬間「無痛強制淘汰」舊快取。
3. **優雅降級 (Graceful Degradation)**：將 Redis 的讀寫用 `try...catch` 包覆，即使 Redis 伺服器當機，系統也只會印出警告，並繼續向 AI 請求翻譯，不會導致整支 API 崩潰 (500 Error)。

---

## 三、 Token 優化與結構化輸出 (Cost & Token Optimization)

AI 的計費與速度取決於 Token 數量。我們進行了極致的「榨乾效能」優化：
1. **清理 Input (垃圾進、垃圾出)**：在將 `recipeData` 餵給 AI 前，透過 JavaScript `filter` 剔除所有空白欄位，大幅減少 Input Tokens。
2. **極簡化 Output (金流節流)**：將原本冗長的變數名稱（如 `ingredients`）縮短為 `ing`，移除 `id` 等不必要的 AI 生成物。
3. **程式碼補全**：秉持「能用 CPU 算就不要用 AI 算」的原則，在後端收到 AI 回應後，透過 `parsedData.id = recipeData.idMeal` 手動補回已知資料。
4. **結構化輸出 (Structured Outputs)**：使用 Gemini 的 `responseSchema` 取代 Prompt 中的文字範例。利用 `enum: ["簡單", "中等", "困難"]` 對 AI 產生「物理限制」，達成 100% 的型別安全 (Type-Safe)，徹底消滅亂碼。
5. **轉接器模式 (Adapter Pattern)**：在前端 `enrichService.jsx` 實作轉接器。讓極簡的後端資料，在此被還原、組裝成 UI 期待的龐大格式。達成**關注點分離**，前端 UI 元件完全不用改寫。

---

## 四、 實務踩坑與高階除錯經驗 (Real-World Troubleshooting)

在部署與協作過程中，我們遇到了三個經典的架構連鎖反應：

1. **PWA Service Worker 快取陷阱 (Blank Screen Issue)**
   - **現象**：API 瞬間部署完成，但使用者的瀏覽器被 PWA 死死抓住舊版 React 程式碼。舊版前端收到新版精簡 JSON 時找不到對應變數，導致畫面崩潰空白。
   - **解法**：開發期透過 Ctrl+F5 強制重整；正式上線時應規劃「API 版本控制 (例如 `/api/v2/`)」或「PWA 畫面更新提示 (Toast)」。
2. **Git 衝突覆寫與快取資料結構不相容 (Cache Schema Incompatibility)**
   - **現象**：因為本地端修改未先 Pull 線上程式碼，導致 Push 時不小心把防護用的 `v2` 命名空間給抹除了。這讓系統去讀取到「舊版龐大 JSON」的快取，送給「新版精簡 Adapter」，再次引發 `undefined` 崩潰。
   - **解法**：補回 `v2` 命名空間，強制廢棄舊快取，並加深對 Git 協作與快取版本控制的警覺。
3. **第三方套件棄用 (Deprecation Warning)**
   - **現象**：Vercel KV 官方棄用 `@vercel/kv`，部署出現警告。
   - **解法**：迅速遷移至原廠推薦的 `@upstash/redis`，保持專案依賴的健康度。

---

> **結語**：
> 這次的迭代將一個單純的「呼叫 API」動作，升級成了一個具備「高可用性、高容錯、低成本、極速反應」的企業級微服務。這些技術決策（Adapter、Fallback、Cache-Aside、Schema）是全端工程師邁向 Senior 階段最重要的基石。
