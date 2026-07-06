# Vercel 部署與自動化 CI/CD 核心觀念筆記

這份筆記記錄了將現代化 React (Vite) 專案部署至 Vercel 的核心知識，包含 Serverless 架構原理、前後端整合方式，以及如何透過 GitHub 實現自動化部署。

---

## 1. 專案架構與 Serverless 整合 (Vite + Vercel)

在傳統伺服器中，我們需要一台機器 24 小時開機運行 Node.js。但在 Vercel 平台上，我們使用的是 **Serverless Functions (無伺服器函式)** 架構。

### ✅ `api/` 資料夾的魔法
* **約定優於設定 (Convention over Configuration)**：Vercel 會自動掃描專案根目錄下的 `api/` 資料夾。任何放在裡面的 `.js` 或 `.ts` 檔案，都會在部署時被自動轉換為獨立的 Serverless API 端點。
* **前端呼叫方式**：前端不需要知道伺服器的絕對網址。只要使用**相對路徑** (例如 `fetch('/api/classify-vegan')`)，Vercel 就會自動把請求路由到對應的 Serverless Function。
* **安全性考量**：API Key (如 `GEMINI_API_KEY`) **絕對不可以**寫在前端的 `.env` 或 `import.meta.env` 中暴露給瀏覽器。正確的做法是將呼叫第三方 API 的邏輯移至 `api/` 資料夾中，並透過 Node.js 的 `process.env.GEMINI_API_KEY` 來存取環境變數。

---

## 2. 自動化部署原理：GitHub Webhooks 與 Git Integration

為何我們只需要在本地端執行 `git push`，線上網站就會自動更新？這背後是由兩個系統協作完成的：

### 📡 廣播端：GitHub Webhooks
當初在 Vercel 點擊「Import from GitHub」時，Vercel 會在您的 GitHub 儲存庫設定裡安裝一個 **Webhook**。
每當有新的 `commit` 被 push 上 GitHub 時，GitHub 就會立刻透過這個 Webhook 發送一個 HTTP 請求 (通知) 給 Vercel 伺服器，告知有新的程式碼更新。

### ⚙️ 接收端：Vercel Git Integration
Vercel 收到 GitHub 的通知後，會根據以下規則決定部署行為：
1. **Production Branch (正式分支)**：通常預設為 `main` 或 `master`。只有 Push 到此分支，Vercel 才會更新您的「正式對外網址」。
2. **Preview Deployments (預覽部署)**：Push 到其他分支 (例如 `feature-a`) 時，Vercel 會建立一個臨時的預覽網址 (Preview URL) 供您測試，而不會影響正式上線的網站。
3. **自動建置流程**：Vercel 會自動在雲端機器上執行 `npm install` 與 `npm run build`，將編譯好的前端靜態檔案 (`dist/`) 部署至 CDN，同時更新 Serverless Functions。

> **💡 控制中心**：您可以在 Vercel Dashboard 的 **Settings > Git** 中調整這些行為，例如設定「忽略某些不需要部署的 Commit」(如僅修改 `README.md`)。

---

## 3. Vercel Dashboard 必檢設定清單 (Checklist)

雖然 Vercel 大多會自動配置完成，但為確保專案正常運作，上線前請務必檢查以下三項設定：

### 🔑 1. 環境變數 (Environment Variables) - 最重要！
* **路徑**：`Settings` > `Environment Variables`
* **動作**：必須將所有後端需要的變數（例如 `GEMINI_API_KEY`）新增進去。若沒有設定，後端 `api/` 的執行將會報錯 500。
* **注意**：設定完成後，必須進行一次重新部署 (Redeploy) 才會生效。

### 📦 2. 建置指令與輸出目錄 (Build Settings)
* **路徑**：`Settings` > `General` > `Build & Development Settings`
* **動作**：Vercel 通常會自動偵測為 Vite 專案。請確認以下設定：
  * **Framework Preset**: `Vite`
  * **Build Command**: `vite build` (或 `npm run build`)
  * **Output Directory**: `dist`

### 🟢 3. Node.js 版本 (Node.js Version)
* **路徑**：`Settings` > `General` > `Node.js Version`
* **動作**：專案如果在 `package.json` 指定了 `"type": "module"`，建議確保 Node.js 版本在 `18.x` 或 `20.x` 以上，以完整支援 ES Modules (`import/export` 語法)。Vercel 預設通常是 20.x，維持預設即可。

---
*文件更新時間：2026-07*
