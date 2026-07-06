# 📚 資料庫快取實戰筆記 (Redis & Vercel KV)

## 核心觀念：為什麼我們需要快取？
在串接第三方 API（如 Google Gemini）時，每次呼叫都需要等待數秒，並且會消耗額度。如果很多使用者都在查詢「同一個食譜」，重複讓 AI 翻譯是非常沒有效率的設計。
導入 Redis (Key-Value 資料庫) 後，我們可以將翻譯結果**暫存**在記憶體中，把 API 響應時間從「3 秒」瞬間壓縮到「0.1 秒」。

---

## 實作步驟與原理剖析

### 1. 命名規範 (Cache Key Design)
```javascript
const cacheKey = `recipe:ai:${recipeData.idMeal}`;
```
在 Redis 這類 Key-Value 資料庫中，業界公認的最佳實踐是使用**冒號 (`:`)** 來做分類（Namespace）。例如 `user:123` 或 `recipe:ai:52772`。未來如果要管理或清除特定種類的快取，就能非常精準。

### 2. 命中快取 (Cache Hit)
```javascript
const cachedData = await kv.get(cacheKey);
if (cachedData) {
  return res.status(200).json(cachedData);
}
```
這是最核心的防線。我們在發送耗時的 AI 請求之前，先去 Redis 查看看。如果有資料（命中），就直接 `return`，完全略過後面的流程。這叫做 **Cache Hit**。

### 3. 寫入快取 (Cache Miss -> Cache Set)
```javascript
await kv.set(cacheKey, parsedData);
```
如果 Redis 找不到資料，稱為未命中 (**Cache Miss**)。程式會繼續走原本的 AI 邏輯。
但在拿到 AI 的辛苦翻譯結果後，我們必須執行 `kv.set` 把結果存進 Redis。這一步是為了「造福下一個點擊同一個食譜的人」。

### 4. 容錯設計與優雅降級 (Graceful Degradation)
```javascript
try {
  await kv.get(cacheKey);
} catch (kvError) {
  console.warn("快取讀取失敗:", kvError.message);
}
```
你可能會想：「萬一 Redis 伺服器掛了怎麼辦？」
為此，我們把操作 Redis 的語法都用 `try...catch` 包覆起來，並只做 `console.warn`。這代表：如果 Redis 當機，程式只會印出警告，然後**繼續走回原本去呼叫 AI 的流程**。
也就是說，快取只負責「加速」，絕對不能因為快取壞掉而導致整個 API 500 崩潰。這種「就算部分零件壞掉，系統依舊能維持基礎運作」的設計，就叫做**優雅降級 (Graceful Degradation)**。
---
這份關於「資料庫快取實戰」的筆記整理得非常出色！你對 **Cache Key**、**Cache Hit/Miss** 以及**容錯設計**的理解完全正確。
順帶一提，你所描述的這個「先查快取 ➔ 沒有就查 API ➔ 寫入快取」的標準流程，在軟體架構中有一個專有名詞，叫做 **Cache-Aside Pattern（旁路快取模式）**，這是業界最經典且最常用的快取策略。
針對你的兩個提問，這涉及到了「系統架構選型」的核心觀念，以下為你進行詳細解析：

### 問題 1：一般小型專案採用這樣的方案（Upstash Redis）合理嗎？有需要為此編寫完整的資料庫架構（如 Laravel）嗎？

**解析與回答：**

非常合理，甚至是現代前端/全端專案的「最佳實踐」：

*   對於小型專案、MVP（最小可行性產品）或是以串接 AI 為主的應用來說，採用 Upstash 這類 Serverless Redis（無伺服器快取服務） 是最完美的選擇。它免去了架設伺服器的麻煩，按使用量計費（通常小型專案根本不用錢），且能立刻達到「降低 API 成本」與「提升回應速度」的目的。

*   不需要為此特地建立完整的資料庫架構（如 Laravel + MySQL）：
    俗話說「殺雞焉用牛刀」。如果你的專案需求只是為了「暫存 AI 的回覆」，特地去架設一個 Laravel 後端加上關聯式資料庫（MySQL/PostgreSQL），會帶來極大的維護成本 (Maintenance Overhead)。你需要管伺服器、管資料庫連線、寫 Migration（資料表遷移）、設定 ORM 等等，這會讓專案變得過於笨重。

### 問題 2：目前採用的方案（Upstash 快取）與實際建立資料庫（如 MySQL）的差異是什麼？相關的知識差異是什麼？

這是一個非常好的問題，這區分了「快取 (Cache)」與「持久化資料庫 (Persistent Database)」的本質差異。

1. 核心定位與儲存媒介的差異

*   Upstash (Redis 快取)：
    *   儲存位置： 記憶體 (In-Memory)。
    *   特性： 讀寫速度極快（通常在毫秒甚至微秒級別），但記憶體很貴，所以容量有限。
    *   定位： 它是**「輔助」**。資料丟失了也沒關係，頂多就是再花 3 秒去問一次 AI。

*   實際資料庫 (如 Laravel 搭配的 MySQL/PostgreSQL)：
    *   儲存位置： 硬碟 (Disk / SSD)。
    *   特性： 讀寫速度相對較慢，但硬碟便宜，可以儲存海量資料。
    *   定位： 它是**「單一真值來源 (Single Source of Truth)」**。使用者的帳號密碼、訂單紀錄都存在這裡，絕對不能遺失。

2. 資料結構的差異

*   Redis (NoSQL / Key-Value)： 就像一個超大的 JavaScript Object `{ key: value }`。你只能透過 `recipe:ai:123` 這樣的 Key 去精準把資料撈出來。

*   關聯式資料庫 (RDBMS)： 像是 Excel 表格，有欄 (Column) 和列 (Row)。你可以做複雜的查詢，例如：「幫我找出所有標籤是『牛肉』且建立時間在『三天內』的食譜」（這在單純的 Redis 中很難做到）。

3. 相關「知識點」的差異

如果你未來要深入這兩個領域，你需要學習的知識樹是完全不同的：

【快取領域 (Redis) 的進階知識點】

*   TTL (Time to Live)： 資料的存活時間。快取不能無限塞滿，通常會設定過期時間（例如 24 小時後自動刪除）。
*   快取失效策略 (Cache Invalidation)： 當原始資料改變時，如何確保快取也被更新？（這是計算機科學中最難的兩個問題之一）。
*   快取三大問題： 快取穿透 (Cache Penetration)、快取擊穿 (Cache Breakdown)、快取雪崩 (Cache Avalanche)。這是後端面試必考題。

【實際資料庫領域 (MySQL/Laravel) 的進階知識點】

*   Schema Design (資料庫綱要設計)： 如何設計資料表？一對多、多對多關聯怎麼建？
*   正規化 (Normalization)： 如何避免資料重複儲存？
*   ACID 特性： 確保交易（Transaction）的安全，例如轉帳時，A 扣錢 B 一定要加到錢，不能中間斷線就出錯。
SQL 語法與索引 (Index) 優化： 如何讓複雜的查詢變快。

### 總結

你目前在專案中採用 Upstash Redis 來做 AI 回應的快取，在架構設計上叫做 「輕量級的 Serverless 架構」，這對於前端工程師獨立開發全端應用來說，是非常聰明且高效的選擇。
未來，如果你的專案擴展到需要「讓使用者註冊登入」、「讓使用者收藏自己的食譜」、「建立社群留言板」時，那時單靠 Redis 就不夠了，你才會需要導入真正的關聯式資料庫（如 PostgreSQL 或透過 Laravel/Next.js Prisma 來建置）。
---

## 進階心法：Token 優化與結構化輸出 (Structured Outputs)

除了使用快取擋下重複請求，我們也在 API 內部實作了榨乾效能的 Token 優化：

### 1. 嚴格鎖定欄位值域 (enum 型別安全)
```javascript
diff: {
  type: SchemaType.STRING,
  enum: ["簡單", "中等", "困難"]
}
```
在使用 Gemini API 的 `responseSchema` 時，與其用文字苦苦哀求 AI 不要亂填資料，不如直接加上 `enum`。這能對模型產生**物理限制**，強制它只能產出合法的字串，達成 **100% 型別安全 (Type-Safe)**，前端 UI 再也不會因為收到「適中」這種非預期字串而破圖。

### 2. 運算資源最佳化 (程式補全 vs AI 生成)
```javascript
// AI 解析完畢後，直接透過程式碼補回已知資料
parsedData.id = recipeData.idMeal;
```
如果前端早就有 `id` 等資訊，**絕對不要讓 AI 浪費 Output Token 把已知資料印出來**（AI 的輸出成本極高且速度慢）。
正確的架構思維是：讓 AI 專心做「翻譯與分析」，剩下固定不變的欄位，在後端收到 AI 結果後，透過 JavaScript 程式碼手動補上去。這能大幅加快 AI 回應速度，同時保證資料完整性。

### 3. 縱深防禦 (Defense in Depth)
```javascript
// 雖然有了 Schema，但保留兜底機制
let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
```
就算使用了 `responseSchema` 確保輸出格式，保留 Regex 解析 Markdown 區塊的邏輯依然是個好習慣。這種「假設第一道防線被突破，還有第二道防線處理」的思維，稱為**縱深防禦**，極大提升了程式碼的容錯率。

---

## 總結
透過這幾步，我們達成了一個具備**高可用性 (High Availability)**、**極致效能 (Redis 快取)** 與 **Type-Safe 結構化輸出**的 API。這是在中大型專案與求職面試中，非常容易被主管問到且極具含金量的架構設計。

---

# Gemini API `responseSchema` vs. 資料庫 Schema 概念筆記

## 一句話結論

Gemini 的 `responseSchema` 確實是在定義「資料的形狀＋型別＋值域」，這點跟資料庫 schema 的精神相同；但它描述的是**單一一次輸出物件的藍圖**（比較像 TypeScript `interface` 或 NoSQL 文件結構），而且強制力的**運作原理**跟資料庫的事後驗證完全不同。

---

## 1. 相同的部分：都是在定義「形狀＋型別＋值域」

| 這次修改的內容 | 資料庫的對應概念 |
|---|---|
| `diff` 從自由文字改成 `enum: ["簡單","中等","困難"]` | 幫欄位設 `ENUM` 型別，或加 `CHECK` constraint |
| `type: SchemaType.STRING / NUMBER` | 欄位型別 `VARCHAR` / `INT` |
| `required: ["cal", "pro", "car"]` | `NOT NULL` |

這部分的理解是對的：兩者都是「先講好規則，讓輸出/輸入符合這個規則」。

---

## 2. 不同的部分一：描述的對象不一樣

- **資料表（關聯式 DB）**：描述的是「很多筆 row 共用的結構」。本質是平的（columns 是固定的一維清單）；遇到一對多關係，要拆成另一張表用外鍵（FK）串起來。
- **Gemini schema**：描述的是「**一次輸出的形狀**」，而且可以無限巢狀——物件裡包物件、物件裡包陣列（例如這次的 `recipeSchema` 裡，`ing` 是陣列、每個元素又是一個 object；`nutr` 本身也是一個 object）。

這種巢狀結構其實比較不像關聯式資料表，反而更接近：
- NoSQL 文件資料庫（例如 MongoDB）的 document schema
- 程式語言裡的型別定義，例如 TypeScript：
  ```typescript
  interface Recipe {
    title: string;
    diff: "簡單" | "中等" | "困難";
    ing: { i: string; a: string }[];
    nutr: { cal: number; pro: string; car: string };
  }
  ```

**更貼切的類比**：Gemini schema 比較像「**一筆 row 的結構（甚至是一個巢狀物件的藍圖）**」，而不是「**一整張 table**」——因為它描述單一一次回應的形狀，不是一個可以塞很多筆資料進去的容器。

---

## 3. 不同的部分二：強制力的運作原理不一樣

| | 資料庫 Schema | Gemini `responseSchema` |
|---|---|---|
| 驗證時機 | 寫入時（write-time）| 生成過程中，逐 token |
| 運作方式 | 規則引擎事後檢查，不符合就報錯拒絕 | Constrained decoding（限制式解碼）：模型每產生一個 token，只能從「符合 schema 語法」的候選字裡挑 |
| 本質 | 先生成/送出 → 再驗證 → 通過或拒絕 | 從生成的**源頭**就讓錯誤結構不可能出現 |

也就是說：
- 資料庫 schema 是「生成完再檢查對不對」——一個**規則引擎**的事後把關。
- Gemini schema 是「從生成的當下就不可能長歪」——引導一個**機率模型**的生成過程（技術名稱：constrained / grammar-constrained decoding）。

效果上很接近「強制保證格式」，但底層機制是兩回事。

---

## 4. 總結表

| 面向 | 資料庫 Schema | Gemini `responseSchema` |
|---|---|---|
| 定義形狀/型別/值域 | ✅ | ✅ |
| 描述對象 | 一整張表（多筆 row） | 單次輸出的一個（巢狀）物件 |
| 結構型態 | 平面，一對多要拆表 | 可任意巢狀（object/array 互相包） |
| 更貼切類比 | 關聯式資料表 | TypeScript interface / NoSQL document schema |
| 強制方式 | 事後驗證（write-time check）| 生成過程中的限制式解碼 |

---


# 快取失效問題實務筆記：Schema 改版後的舊資料殘留

## 問題現象
- 更新 API 的資料結構（schema）並部署到 Vercel
- 前端畫面顯示空白，抓不到欄位
- 排查 Gemini API、schema 定義本身都正常，仍然找不到問題點

## 根本原因：程式碼跟快取的生命週期不一致

| 項目 | 生命週期 |
|---|---|
| Vercel Functions（程式碼） | 每次部署都是全新的、無狀態 |
| Redis 快取 | 獨立於部署之外，持續存在 |

當程式碼把 schema 從舊欄位（`title_zh`、`ingredients[].item`）改成新欄位（`title`、`ing[].i`）並部署後，**新程式碼是對的，但 Redis 裡舊的快取紀錄不會自動更新或消失**。

因為快取的 key 是用 `recipeData.idMeal` 組成（例如 `recipe:ai:1234`），只要曾經被查詢過同一筆資料，Redis 裡就存在一筆「用舊格式存的」紀錄。`cache hit` 邏輯會直接把這筆舊資料回傳，完全繞過新的程式碼邏輯：

```javascript
const cachedData = await kv.get(cacheKey);
if (cachedData) {
  return res.status(200).json(cachedData); // 舊資料直接回傳，新邏輯完全沒被執行到
}
```

這也是為什麼排查時容易卡關——問題不在 API 呼叫、不在 schema 定義本身，而是**新程式碼根本沒被執行到**。

## 解決方式：快取 key 版本化

```javascript
const cacheKey = `recipe:ai:v2:${recipeData.idMeal}`;
```

幫 key 加上版本號，等於幫新格式的資料開一個全新命名空間。Redis 裡找不到 `v2` 開頭的 key，一定會是 cache miss，強制重新呼叫 AI、用新 schema 產生資料。

## 這是業界常見模式，不只出現在快取

- **快取 key 版本化**（本次採用的方式）
- **API 版本控制**：`/api/v1/...` → `/api/v2/...`
- **資料庫 migration 版本號**

有一句常見的說法：「電腦科學裡只有兩件難事：快取失效（cache invalidation）與命名（naming things）」，這次遇到的正是前者的典型案例。

## 後續加強建議：加上 TTL 當保底機制

即使記得改版本號，也建議寫入快取時順手加上存活時間（TTL），降低「忘記改版本號」造成資料長期卡住不更新的風險：

```javascript
// 設定 7 天後自動過期
await kv.set(cacheKey, parsedData, { ex: 60 * 60 * 24 * 7 });
```

## 一般化檢查清單

往後遇到「資料改了但沒生效」的狀況，可以先確認：

1. 程式碼與使用者之間是否有快取層（Redis、CDN、瀏覽器快取）？
2. 快取 key 是否包含「資料結構版本」，還是只包含「資料識別碼」？
3. 是否有設定 TTL 作為保底機制？
4. 部署新版程式碼後，是否需要手動清除舊快取？

---

104專案更新紀錄:

- 系統重構與優化 (2026.07)：

導入 upstash KV 作為查詢快取層，以查詢參數組成唯一快取鍵值進行命中比對，並透過 Gemini API 的 Schema 格式約束 AI 回應內容——查詢時先比對快取，命中則直接回傳結果，未命中才呼叫 Gemini API，藉此降低重複查詢造成的 API 請求量與回應延遲。(0607)