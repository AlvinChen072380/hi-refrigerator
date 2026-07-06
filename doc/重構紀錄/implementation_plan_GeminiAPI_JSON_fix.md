# 任務 C：AI Token 消耗優化計畫 (Prompt & JSON Refactoring)

## 現有格式 Token 消耗痛點分析

在評估 `api/enrich-recipe.js` 的 JSON 格式後，發現有幾個會嚴重浪費 **Output Tokens (輸出權杖)** 的潛在問題。
*(註：在各大 AI 模型計費中，Output Token 的成本通常是 Input Token 的 3 到 4 倍，且輸出越長，回應速度越慢。)*

### 🚨 痛點 1：讓 AI 重複輸出已知資訊 (無效 Output)
```json
"id": "原始ID",
"title_en": "原始英文標題",
"original_text": "保留原始英文食材描述"
```
這三個欄位前端早就知道了（前端傳給 API 的資料裡就包含 ID 和英文標題）。要求 AI 再把這些字「原封不動」印出來，是在白白浪費昂貴的 Output Tokens 和運算時間。

### 🚨 痛點 2：陣列中冗長的 Key 名稱
```json
// 食材陣列與步驟陣列
"ingredients": [ { "item": "...", "amount": "...", "original_text": "..." } ],
"steps": [ { "step_number": 1, "content": "...", "action_tag": "..." } ]
```
在 JSON 陣列中，如果一道菜有 15 個步驟，`step_number`、`content`、`action_tag` 這些 Key 就會被重複印出 15 次。如果把這些 Key 縮短，能有效減少整體字數。

### 🚨 痛點 3：前端傳入的 Input Data 過於龐大 (Input Waste)
目前的 `${JSON.stringify(recipeData)}` 可能是直接把 TheMealDB 的原始資料塞進去。MealDB 的資料包含了 `strIngredient1` 到 `strIngredient20`，其中很多是 null 或空字串，這會無謂地消耗 Input Tokens。

---

## Proposed Changes (優化方案)

### 1. [MODIFY] `api/enrich-recipe.js` (Prompt 與回傳結構優化)
*   **移除冗餘欄位**：砍掉 `id`、`title_en`、`original_text`。
*   **縮短 Key 名稱**：將長變數名稱改為業界常用的縮寫。
    *   `description_zh` -> `desc`
    *   `nutrition_estimate` -> `nutr`
    *   `ingredients` -> `ing`
    *   `steps` -> `steps` (保留)
    *   `step_number`, `content`, `action_tag` -> 移除 `step_number` (前端可以用陣列 index + 1 推算)，改為 `txt`, `act`。

**優化後的精簡 JSON 目標結構**：
```json
{
  "title": "繁體中文菜名",
  "desc": "簡短介紹",
  "diff": "簡單",
  "time": "25分鐘",
  "tags": ["標籤1"],
  "nutr": { "cal": 100, "pro": "10g", "car": "20g" },
  "ing": [
    { "i": "食材名", "a": "份量" }
  ],
  "steps": [
    { "txt": "步驟說明", "act": "動作" }
  ]
}
```

### 2. [MODIFY] 前端資料處理層 (Adapter Pattern)
因為 API 回傳的結構變了，如果直接送到前端，畫面會破圖。
我們需要在呼叫 API 後，做一層 **Adapter (轉接器)**，把原本被砍掉的 `id` 補回去，並把短的 Key 映射回原本前端畫面需要的格式，這樣就不需要去動 UI 元件 (RecipeModal) 的程式碼。

---

## User Review Required

> [!CAUTION]
> **前端架構連動確認**
> 這次的優化會改變 API 回傳的欄位名稱。這意味著我們必須同步修改**前端呼叫 API 後處理資料的地方**（目前應該在 `useVeganAi.jsx` 或 `App.jsx` 中）。
> 
> **請問您是否同意執行這個 Token 優化計畫？**
> 如果同意，這將會是我們合併到 main 分支前的最後一塊拼圖！
