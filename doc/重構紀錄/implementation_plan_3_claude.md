# CSS → Tailwind 重構樣式驗證計畫

## 背景說明

目標：系統性地比對每個元件，確認舊版傳統 CSS（1106 行的 `index.css`）的所有樣式設定，在 Tailwind 版本中都被正確翻譯，無遺漏、無跑版。

---

## 檢查範圍與各元件問題初判

以下是依元件逐一整理的**已知問題或需要重點核對的項目**。

---

### 📋 Layer 0：全域基礎 (`index.css`)

**舊版 CSS 設定：**
- `@keyframes spin` / `@keyframes pulse` — loading 動畫，目前 Tailwind 使用 `animate-spin` / `animate-pulse` ✅
- `body` 設定字型、背景、行高、轉場動畫 ✅（保留在 `index.css`）
- Scrollbar 隱藏（html / .modal-left / .modal-right / .modal-content）✅

**⚠️ 待確認：**
- `@keyframes spin` / `pulse` 是否真的已被 Tailwind 原生動畫類別完整涵蓋（spin 速度是 1s linear，pulse 是 3s ease-in-out）？

---

### 📋 Layer 1：`App.jsx` — `.app-container`

| 舊版 CSS | 目前 Tailwind class |
|---|---|
| `min-height: 100dvh` | `min-h-[100dvh]` ✅ |

**⚠️ 待確認：** `app-container` class 仍在 JSX 裡，但 `index.css` 已無定義，僅 Tailwind inline → 需確認 GSAP 是否依賴此 class name 選取器？

---

### 📋 Layer 2：`NavBar.jsx` — 導覽列

| 樣式屬性 | 舊版 CSS (`.app-nav`, `.theme-toggle-btn` 等) | 目前 Tailwind class | 狀態 |
|---|---|---|---|
| 定位 | `position: absolute; top: 20px; right: 20px; z-index: 100` | `absolute top-5 right-5 z-50` | ⚠️ `top-5 = 20px` ✅，但 `z-50` ≠ `z-index: 100`，Tailwind z-50 = 50 |
| 按鈕尺寸 | `width: 45px; height: 45px` | `w-[45px] h-[45px]` ✅ | ✅ |
| 背景、邊框、圓形 | `background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 50%` | `bg-[--card-bg] border border-[--border-color] rounded-full` ✅ | ✅ |
| Hover 旋轉 | `transform: rotate(360deg)` | `hover:rotate-[360deg]` ✅ | ✅ |
| Active 縮放 | `transform: scale(0.95)` | `active:scale-95` ✅ | ✅ |
| `info-container` padding-right | `padding-right: 12px` | `pr-3 (12px)` ✅ | ✅ |
| `margin-right` between Vegan & Theme btn | 舊版 `.theme-toggle-btn` 在 RWD 有 `margin-right: 10px` | `mr-2.5 (10px)` ✅ | ✅ |

> **⚠️ 問題 1：`z-index` 不一致**
> 舊版 `.app-nav { z-index: 100 }`，目前 Tailwind 使用 `z-50`（= z-index: 50）。這在 Modal 開啟時是否會有層級問題？

> **⚠️ 問題 2：`VeganToggle.jsx` 的 `vegantoggle-btn` class**
> VeganToggle 按鈕使用的是 `className="vegantoggle-btn"`，但此 class 在新的 `index.css` 中**完全沒有定義**！樣式將完全消失。

---

### 📋 Layer 3：`HeroSearch.jsx` — 搜尋區塊

| 樣式屬性 | 舊版 CSS | 目前 Tailwind | 狀態 |
|---|---|---|---|
| `.hero-section` | `min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding-top: 40px` | `min-h-[100dvh] w-full flex flex-col justify-center items-center pt-10 (40px)` ✅ | ✅ |
| `header` padding | `40px 20px 20px 20px` | `pt-10 px-5 pb-5` → `40px 20px 20px 20px` ✅ | ✅ |
| `.search-box` | `display: flex; gap: 10px; max-width: 600px; margin: 10px 0 40px; padding: 0 20px; position: relative` | `flex flex-col sm:flex-row gap-2.5 w-full max-w-[600px] mt-2.5 mb-10 px-4 sm:px-5 relative` | ⚠️ |
| `.search-input` focus shadow | `box-shadow: 0 5px 20px rgba(230, 126, 34, 0.2)` | `focus:shadow-[0_5px_20px_rgba(230,126,34,0.2)]` ✅ | ✅ |
| `.search-btn` disabled | `background-color: #ccc; cursor: not-allowed; transform: scale(0.95)` | `disabled:bg-[#ccc] disabled:cursor-not-allowed disabled:scale-95` ✅ | ✅ |
| RWD `.search-box` | `flex-direction: column; gap: 15px` | `flex-col sm:flex-row gap-2.5` | ⚠️ |

> **⚠️ 問題 3：`gap` 值不一致**
> 舊版桌面版 `gap: 10px`，手機版 `gap: 15px`。目前 Tailwind 統一使用 `gap-2.5 (10px)`，手機版應改為 `sm:gap-[15px]` 或在 flex-col 情況下保有正確 gap。

> **⚠️ 問題 4：`.search-box` padding 在手機版**
> 舊版手機版 `.search-box { padding: 0 20px }`，目前 `px-4 sm:px-5` = `16px sm:20px`，手機版 padding 從 20px 降為 16px，略有差異。

> **⚠️ 問題 5：AI 翻譯提示條（aiSuggestion）**
> 舊版 CSS 無此樣式（是新功能），目前使用 Tailwind inline，需確認樣式正確性。

---

### 📋 Layer 4：`StatusBoard.jsx` — 狀態顯示板

| 元件/class | 舊版 CSS | 目前 Tailwind | 狀態 |
|---|---|---|---|
| `.loading-container` | `display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: var(--primary-color)` | `flex flex-col items-center justify-center p-10 text-[--primary-color]` ✅ | ✅ |
| `.spinner` | `width:40px; height:40px; border: 4px solid rgba(230,126,34,0.2); border-top: 4px solid var(--primary-color); border-radius:50%; animation: spin 1s linear infinite; margin-bottom:15px` | `w-10 h-10 border-4 border-[rgba(230,126,34,0.2)] border-t-[--primary-color] rounded-full animate-spin mb-4` | ⚠️ |
| `.loading-text` | `font-weight: bold; font-size: 1.1rem; animation: pulse 3s ease-in-out infinite` | `font-bold text-[1.1rem] animate-pulse` | ⚠️ |
| `.error-msg` | `text-align: center; color: red; font-size: 1.2rem` | `text-center text-red-500 text-[1.2rem]` ✅ | ✅ |
| Warning div | 新樣式（舊版無） | `bg-orange-50 border border-orange-100 ...` | 新增 |

> **⚠️ 問題 6：`animate-spin` 速度**
> 舊版 `spin 1s linear infinite`，Tailwind `animate-spin` 預設是 `1s linear infinite` ✅。但 `animate-pulse` 預設是 `2s cubic-bezier(0.4,0,0.6,1) infinite`，舊版是 `3s ease-in-out infinite` — **速度不同！**

> **⚠️ 問題 7：`warning` 區塊使用了固定顏色 (`bg-orange-50`, `text-orange-700`)**
> 此區塊不支援 dark mode 切換（舊版用 CSS variable，此處用 Tailwind 固定色）。在深色模式下可能會有對比問題。

---

### 📋 Layer 5：`RecipeList.jsx` + `RecipeCard.jsx` — 食譜列表

| 元件/class | 舊版 CSS | 目前 Tailwind | 狀態 |
|---|---|---|---|
| `.results-container`（網格） | `max-width: var(--container-width); margin: 0 auto; padding: 0 20px 60px; display: grid; grid-template-columns: repeat(auto-fill,minmax(250px,1fr)); gap: 30px` | `max-w-[--container-width] mx-auto px-5 pb-[60px] grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[30px]` ✅ | ✅ |
| `.recipe-card` 過渡 | `transition: var(--transition-medium)` = `0.4s cubic-bezier(0.25, 0.8, 0.25, 1)` | `transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)]` ✅ | ✅ |
| `.recipe-card` hover | `transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.12)` | `hover:-translate-y-[10px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]` ✅ | ✅ |
| `.recipe-card` 初始狀態（GSAP） | `opacity: 0; visibility: hidden` | `opacity-0 invisible` ✅ | ✅ |
| 按鈕 hover border-top | `border-top: 1px solid var(--border-color)` | `border-t border-[--border-color]` ✅ | ✅ |

---

### 📋 Layer 6：`RecipeModal.jsx` — 食譜彈窗

| 元件/class | 舊版 CSS | 目前 Tailwind | 狀態 |
|---|---|---|---|
| `.modal` 外層 | `fixed; z-index:999; backdrop-filter: blur(8px); display:flex; justify-content:center; align-items:center; padding: 60px 20px 20px 20px` | `fixed inset-0 z-[999] bg-[--modal-overlay] backdrop-blur-[8px] flex justify-center items-center p-5 pt-[60px]` | ⚠️ |
| `.modal-wrapper` 定位 | `position: relative; width:100%; max-width:1000px; margin: auto; z-index:1000; transition: transform 0.3s ease-out; pointer-events: auto` | `relative w-full max-w-[1000px] m-auto z-[1000] transition-transform duration-300 ease-out pointer-events-auto` ✅ | ✅ |
| `.close-btn` | `position: absolute; top: -50px; right: 0; ...` | `absolute -top-[50px] right-0 ...` ✅ | ✅ |
| `.modal-content` | `height: 85dvh; border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: row; overflow-y: auto` | `bg-[--card-bg] w-full h-[85dvh] rounded-[--radius-lg] shadow-[...] relative overflow-hidden flex flex-row text-[--text-main] overflow-y-auto` ✅ | ✅ |
| `.modal-grid` | `display: grid; grid-template-columns: 1.8fr 1.3fr; height: 100%; overflow: hidden` | `grid grid-cols-[1.8fr_1.3fr] h-full overflow-hidden w-full` ✅ | ✅ |
| RWD Mobile (modal) | `height: 90dvh; display: block; overflow-y: scroll` | **完全沒有 RWD 響應式處理！** | 🚨 |
| `mobile-tabs` | `display: none` 桌面隱藏 | `hidden`（整個 div 改為 hidden，但 RWD 沒有 sm:flex）| ⚠️ |

> **🚨 問題 8：RecipeModal 手機版 RWD 完全遺失（高優先）**
> 舊版在 `@media (max-width: 768px)` 有大量的 Modal 響應式設定（`.modal-content` 變高度、`.modal-grid` 變 flex-direction: column、`.close-btn` 變 fixed 定位等），目前 Tailwind 版本中這些全部消失！
> 這是造成「跑版」的最主要原因之一。

---

### 📋 Layer 7：`RecipeContent.jsx` — 食譜內容（左欄）

| 元件/class | 舊版 CSS | 目前 Tailwind | 狀態 |
|---|---|---|---|
| `.modal-left` | `padding: 40px; overflow-y: auto; background-color: var(--card-bg)` | `p-10 overflow-y-auto bg-[--card-bg]` ✅ | ✅ |
| `.modal-left h2` | `font-size: 1.5rem; font-weight: bold` | `text-2xl font-bold`（`text-2xl = 1.5rem`）✅ | ✅ |
| `.modal-img` | `aspect-ratio: 4/3; border-radius: var(--radius-md); margin-bottom: 25px; background-color: #eee` | `aspect-[4/3] rounded-[--radius-md] mb-[25px] bg-[#eee]` ✅ | ✅ |
| `.yt-link` | `display: inline-block; margin-top: 20px; color: var(--danger-color); border: 1px solid; padding: 10px 20px; border-radius: 50px; transition: 0.3s` | `inline-block mt-5 text-[--danger-color] no-underline font-bold border border-[--danger-color] py-2.5 px-5 rounded-[50px] transition-colors duration-300` ✅ | ✅ |
| `.ai-btn` 主色 | `background: linear-gradient(135deg, #6366f1, #a855f7); box-shadow: 0 4px 15px rgba(168,85,247,0.3)` | `bg-gradient-to-br from-[#6366f1] to-[#a855f7] shadow-[0_4px_15px_rgba(168,85,247,0.3)]` ✅ | ✅ |
| `.ai-tag` | `background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem` | `bg-[#e0f2fe] text-[#0369a1] py-1 px-2 rounded text-[0.8rem]` ✅ | ✅ |
| RWD `.modal-img` | `aspect-ratio: 16/9` | **未實作 RWD** | 🚨 |
| `.modal-left` RWD | `display: none; padding: 20px; height: auto` | **未實作 RWD** | 🚨 |
| `.modal-left.active-content` | `display: block` | 目前使用 `hidden md:block` 搭配 `active-content` class，需核實 | ⚠️ |

---

### 📋 Layer 8：`ShoppingList.jsx` — 右欄購物清單

| 元件/class | 舊版 CSS | 目前 Tailwind | 狀態 |
|---|---|---|---|
| `.modal-right` | `background: var(--bg-color); padding: 40px 30px; overflow-y: auto; display: flex; flex-direction: column` | `bg-[--bg-color] py-10 px-[30px] overflow-y-auto flex flex-col` ✅ | ✅ |
| `.ingredient-list li` hover | `border-color: var(--accent-blue); transform: translateX(5px)` | `hover:border-[--accent-blue] hover:translate-x-[5px]` ✅ | ✅ |
| `.ingredient-list.anim-done li` | 有 transition: transform（GSAP 動畫完成後） | **class `anim-done` 在 CSS 中無定義** | ⚠️ |
| `.custom-checkbox` | 舊版使用 CSS 偽元素 `::after { content: "✓" }` | 目前改為 inline `<span>✓</span>` JSX | ✅ 改法可接受 |
| `.restore-btn` hover | `background: #2980b9` | `hover:bg-[#2980b9]` ✅ | ✅ |
| `.copy-btn` hover | `background-color: var(--primary-color); color: white; border-color: transparent` | `hover:bg-[--primary-color] hover:text-white hover:border-transparent` ✅ | ✅ |
| RWD `.modal-right` | `display: none; padding: 20px; height: auto` | **未實作 RWD** | 🚨 |
| `.modal-right.active-content` | `display: block` | 目前 `hidden md:flex` 但缺少 `active-content` class 激活邏輯 | ⚠️ |

---

### 📋 Layer 9：`Modal.tsx` (TechStackModal 的 base) — 仍使用 CSS Class

> **⚠️ 問題 9：Modal.tsx 混用 CSS class 和 Tailwind**
> `Modal.tsx` 中使用了 `modal-overlay-tech`, `modal-wrapper-tech`, `modal-content-tech`, `modal-header-tech`, `modal-title-tech`, `modal-body-tech` 等 class，這些需要繼續定義在 `index.css` 中，但目前 `index.css` 只有 87 行，**這些 class 的定義已被清空**！

---

### 📋 Layer 10：`VeganToggle.jsx`

> **🚨 問題 10：`vegantoggle-btn` class 完全消失（高優先）**
> `VeganToggle.jsx` 使用 `className="vegantoggle-btn"` 但新版 `index.css` 無任何定義。
> 舊版樣式：
> ```css
> .vegantoggle-btn {
>   background: var(--card-bg);
>   border: 1px solid var(--border-color);
>   border-radius: 50%;
>   width: 45px; height: 45px;
>   cursor: pointer; display: flex;
>   align-items: center; justify-content: center;
>   box-shadow: 0 4px 6px var(--shadow-color);
>   transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
>   color: var(--text-main);
> }
> ```
> 需要轉換為 Tailwind class 或補回 CSS 定義。

---

## 問題彙整總表

| # | 優先級 | 元件 | 問題描述 |
|---|---|---|---|
| 1 | 🟡 中 | NavBar | z-index 不一致（100 → 50） |
| 2 | 🔴 高 | VeganToggle | `vegantoggle-btn` class 無定義，按鈕無樣式 |
| 3 | 🟡 中 | HeroSearch | gap 在手機版不一致（10px → 15px） |
| 4 | 🟢 低 | HeroSearch | 手機版 padding 從 20px 降為 16px |
| 5 | 🟢 低 | HeroSearch | AI 提示條樣式需確認 dark mode 相容性 |
| 6 | 🟡 中 | StatusBoard | `animate-pulse` 速度不同（2s vs 3s） |
| 7 | 🟡 中 | StatusBoard | Warning 區塊固定色不支援 dark mode |
| 8 | 🔴 高 | RecipeModal | **手機版 RWD 完全遺失**（最主要跑版原因） |
| 9 | 🔴 高 | Modal.tsx | Tech Modal CSS class 在 index.css 消失 |
| 10 | 🔴 高 | VeganToggle | `vegantoggle-btn` class 無定義 |
| 11 | 🟡 中 | ShoppingList | `anim-done` class 在 CSS 無定義 |
| 12 | 🟡 中 | RecipeContent | 手機版 `modal-left` / `active-content` RWD 未完整對應 |

---

## 建議執行流程（分批修正）

### 第一批：緊急修復（跑版主因）
1. **修復 `VeganToggle.jsx`** → 將 `vegantoggle-btn` 的樣式轉為 Tailwind class
2. **補回 Tech Modal CSS class** → 確認 `modal-overlay-tech` 等 class 的來源

### 第二批：手機版 RWD 補完
3. **`RecipeModal.jsx`** → 補全手機版 RWD（`md:` breakpoint 處理）
4. **`RecipeContent.jsx` / `ShoppingList.jsx`** → `active-content` class 機制確認
5. **`HeroSearch.jsx`** → `search-box` 手機版 gap / padding 調整

### 第三批：細節調整
6. `animate-pulse` 速度調整
7. Warning 區塊 dark mode 兼容
8. z-index 確認

---

## 開放問題（請你決定）

> [!IMPORTANT]
> **關於 `modal-overlay-tech` 等 Tech Modal CSS class 的處理策略**
> 目前 `Modal.tsx` 仍在使用純 CSS class（如 `modal-overlay-tech`、`modal-content-tech` 等），而不是 Tailwind。
> 有兩個選項：
> - **選項 A（保留 CSS）**：將這些 class 補回 `index.css`，維持現有架構不動。
> - **選項 B（全部 Tailwind）**：將 `Modal.tsx` 內的 class 也全部轉成 Tailwind inline class。
> 請告訴我你的偏好。

> [!IMPORTANT]
> **關於 RWD 手機版 Modal 的修復策略**
> 舊版使用 `@media (max-width: 768px)` + JS class toggle 方式。現在要：
> - **選項 A**：使用 Tailwind 響應式前綴（`md:`, `hidden`, `block`）完整重建
> - **選項 B**：在 `index.css` 中補回手機版 `@media` 規則作為例外
> 選項 A 更符合 Tailwind 架構，但需要較大幅度修改元件 JSX。
