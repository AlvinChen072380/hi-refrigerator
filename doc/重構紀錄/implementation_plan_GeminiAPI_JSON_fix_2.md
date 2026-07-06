# API Schema Refactoring Plan

## 目標與背景 (Goal)
稍早我們在 `api/enrich-recipe.js` 成功導入了 Gemini 的 `responseSchema`（結構化輸出），帶來了**省 Token** 與 **100% 型別安全** 的巨大優勢。
這個計畫將分析並把相同的架構策略應用到專案中的另外兩支 AI API：`classify-vegan.js` 與 `smart-search.js`。

## 分析結果 (Analysis)
**結論：非常適合！強烈建議進行重構。**

### 1. 針對 `api/classify-vegan.js`
- **現狀**：已經使用了 `responseMimeType: "application/json"`，但依賴 Prompt 文字來約束回傳 `{ "safeIds": [...] }`，且下方還有冗長的 Regex 防呆程式碼。
- **重構優勢**：加上 Schema 後，能徹底確保 `safeIds` 一定是個字串陣列 (Array of Strings)，不會因為 AI 突然發瘋回傳 `{ "safe": true }` 而導致前端報錯。
- **預期修改**：定義 `SchemaType.ARRAY`，移除 Prompt 中的 JSON 範例，並刪除下方複雜的 Regex `try...catch` 邏輯。

### 2. 針對 `api/smart-search.js`
- **現狀**：目前**連 `responseMimeType` 都沒有設定**！完全依賴 AI 聽懂文字指令，並靠著脆弱的 `replace(/```json|```/g, "")` 來強行剝離 Markdown 標記。
- **重構優勢**：這支 API 負責將中文食材轉譯為英文關鍵字（例如 `{ english_keyword: "pork", is_multiple: false }`）。導入 Schema 能強制保證 `is_multiple` 是嚴格的布林值 (Boolean)，避免它變成字串 `"true"` 或 `"yes"` 導致判斷邏輯壞掉。
- **預期修改**：定義包含 `BOOLEAN` 與 `STRING` 的 Schema，加入 `responseMimeType`，並移除 Regex 清理邏輯。

---

## Proposed Changes (實作細節)

### Components: Vegan API
#### [MODIFY] `api/classify-vegan.js`
- 引入 `SchemaType`。
- 新增 `veganSchema` 定義：
  ```javascript
  const veganSchema = {
    type: SchemaType.OBJECT,
    properties: {
      safeIds: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Array of safe recipe ID strings"
      }
    },
    required: ["safeIds"]
  };
  ```
- 綁定到 `generationConfig`。
- 移除 Prompt 中關於 JSON 輸出的文字描述。
- 簡化解析邏輯，直接 `JSON.parse(responseText)`。

---

### Components: Smart Search API
#### [MODIFY] `api/smart-search.js`
- 引入 `SchemaType`。
- 新增 `searchSchema` 定義：
  ```javascript
  const searchSchema = {
    type: SchemaType.OBJECT,
    properties: {
      original_input: { type: SchemaType.STRING },
      english_keyword: { type: SchemaType.STRING, description: "Ingredients translated to English, joined by commas. Use underscores for multi-word ingredients." },
      is_multiple: { type: SchemaType.BOOLEAN }
    },
    required: ["original_input", "english_keyword", "is_multiple"]
  };
  ```
- 綁定 `responseMimeType: "application/json"` 與 `responseSchema` 到 `generationConfig`。
- 移除 Prompt 中的 Expected Output Format JSON 範本。
- 移除 Markdown Regex 清理邏輯，直接 `JSON.parse`。

---

## User Review Required
> [!IMPORTANT]
> 請問您是否同意上述的重構計畫？如果同意，我將立即為您修改這兩個檔案。
