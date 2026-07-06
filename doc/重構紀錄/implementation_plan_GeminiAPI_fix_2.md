# AI API 穩定度架構升級計畫

為了解決 Gemini API 高負載造成的 503 錯誤，我們將此部分獨立為兩個重構任務。您可以視時間與需求，逐步將其實作。

---

## 任務 A：API 韌性升級 (Retry & Model Fallback)

此任務為**短期止血方案**，旨在不增加外部依賴的情況下，提高既有架構的容錯率。

### Proposed Changes
#### [MODIFY] `api/enrich-recipe.js`
1. **加入 Retry 迴圈**：針對網路請求加入重試機制（最多重試 2 次，間隔 1 秒）。
2. **加入 Model Fallback (降級機制)**：
   - 預設呼叫 `gemini-2.5-flash-lite`。
   - 若捕獲到 503 錯誤，則在下一次重試時，將模型切換為負載較低的 `gemini-1.5-flash` 或 `gemini-1.5-pro`。
3. **優化 JSON 解析**：加入正則表達式，去除回傳結果可能包含的 ```json  ``` 標記，徹底解決 JSON.parse 報錯的問題（原痛點四）。

---

## 任務 B：資料庫快取層建置 (Database Caching 完整規劃)

此任務為**長期架構升級**。透過引入快取機制，大幅降低 API 呼叫次數、提升載入速度（從 3 秒縮短至 0.1 秒），並徹底避開 API 負載限制，是履歷上非常亮眼的架構設計。

### 1. 技術選型推薦：Vercel KV (Redis)
因為您的專案已經部署在 Vercel 且使用了 Vercel Serverless Function，因此最完美且無縫的選擇是 **Vercel KV (基於 Redis 的 Serverless 資料庫)**。
* **優點**：不需跳出 Vercel 平台，不需手動管理環境變數（Vercel 會自動注入），提供極快的讀寫速度。

### 2. 快取工作流程 (Workflow)
在 `api/enrich-recipe.js` 的處理流程將改變為：
1. **檢查快取 (Cache Hit)**：收到前端請求後，以食譜 ID 建立字串 Key（例如：`recipe:ai:52772`）。
2. 使用 `kv.get(Key)` 查詢 Redis。
3. **若快取存在**：直接回傳快取資料（API 耗時約 50ms）。
4. **若快取不存在 (Cache Miss)**：
   - 呼叫 Gemini API（帶有任務 A 的 Retry 機制）。
   - 取得正確 JSON 後，使用 `kv.set(Key, Data)` 將結果存入 Redis。
   - 回傳資料給前端。

### 3. Proposed Changes (實作細節)

#### [NEW] 前置作業 (User 需手動操作)
1. 登入 Vercel 後台。
2. 進入專案的 **Storage** 分頁。
3. 建立一個新的 **KV Database**，並連結到此專案。
   *(這會自動將 `KV_REST_API_URL` 與 `KV_REST_API_TOKEN` 加入環境變數)*
4. 在本地開發環境，您需要執行 `vercel env pull .env.local` 來將金鑰同步到本地端。

#### [MODIFY] 依賴套件與環境
- 安裝 `@vercel/kv` 套件：執行 `npm i @vercel/kv`。

#### [MODIFY] `api/enrich-recipe.js`
- 引入 `@vercel/kv`。
- 實作前述的 Cache Hit/Miss 邏輯。

---

## User Review Required

> [!IMPORTANT]
> **請選擇下一步的行動方向：**
> 
> 1. **先實作任務 A**：最快解決目前的 503 問題。只要您同意，我立刻幫您修改程式碼。
> 2. **直接挑戰任務 A + 任務 B**：如果您想直接導入快取架構，我們可以一起動手。**但需要請您先完成「Vercel 後台建立 KV 資料庫」的前置作業**，完成後再告訴我。
> 3. 對於剛才擱置的「**樣式重構 (CSS Modules)**」，您希望穿插在哪個階段進行呢？

## Verification Plan
1. **任務 A 驗證**：在本地端暫時將 API Key 改錯，或強制拋出 503，驗證 Retry 與 Fallback 邏輯是否觸發。
2. **任務 B 驗證**：連續點擊同一個食譜兩次，透過 Network 面板觀察第二次的 API 請求時間是否從數秒縮短至毫秒等級。
