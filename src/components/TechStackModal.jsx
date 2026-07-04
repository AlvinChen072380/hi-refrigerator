import Modal from "./Modal";

export default function TechStackModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="TECH STACK..."
      className="modal-title"
      maxWidth="xl"
    >
      <div className="modal-desc">
        <p className="first-desc">
          Welcome to <strong>Hi ! refrigerator</strong>, a conceptual recipe search website power by Gemini AI. It is built to demonstrate basic modern <strong>React + Vite </strong> development patterns.           
        </p>
        <ul className="modal-desc-ul">
          <li className="li-style-test">
            <h4>Core Infrastructure(核心架構搭建)</h4>
            <p>
              <strong>Vite</strong>:<br/>使用 Vite 建構高校開發環境，並利用內建的HMR(熱模組替換)提升效率，不用一直等重新整理。
            </p>
            <p>
              <strong>React 18</strong>:<br/>使用 Functional Component 建構模組化的SPA介面。
            </p>
            <p>
              <strong>JavaScript(ES6+)</strong>:<br/>運用 Async/Await 處理非同步邏輯，並使用 Map/Filter等陣列方法進行資料清洗與結構重整。
            </p>   
          </li>
          <li className="li-style-test"> 
            <h4>State & Logic(狀態管理)</h4>
            <p>
              <strong>React Hooks</strong>:<br/>靈活運用 useState 與 useEffect 來控制組件的生命週期與副作用，useRef 綁定 DOM 元素以整合 GSAP 動畫，避免觸發不必要的Re-render。
            </p>  
            <p>
              <strong>Custom Hooks</strong>:<br/>將商業邏輯(useRecipe)的API請求與資料邏輯抽離，實踐 Separation of Concerns，封裝(useTheme)深色模式的切換邏輯與持久化設定。
            </p>                 
            <p>
              <strong>LocalStorage</strong>:<br/>實作瀏覽器端的 資料持久化，確保使用者重新整理後，「購物清單」與「主題設定」能維持刷新前狀態。
            </p>    
            <p>
              <strong>Error Handling</strong>:<br/>使用 Try...catch 預先設置錯誤發生時的提示，同時搭配正則表達式進行輸入資料的核對，並實作 Loading狀態、處理邊界錯誤與查無資料時的UI回饋。
            </p>   
          </li>
          <li className="li-style-test">
            <h4>UI/UX & Styling(風格細節與介面體驗)</h4>
            <p>
              <strong>CSS3</strong>:<br/>建立語意化的 Design System 變數，以達成 Dark Mode 深色模式的切換，使用偽元素建立質感較佳的 Checkbox，取代傳統原生元件。 
            </p>
            <p>
              <strong>Modern Layout</strong>:<br/>結合 Flexbox 與 CSS Grid，製作能夠適應不同裝置尺寸的響應式排版，針對移動裝置優化，處理瀏海屏的 safe-area-inset 以及解決 Modal 滾動穿透與定位的問題。
            </p> 
            <p>
              <strong>GSAP</strong>:<br/>運用 TimeLine 製作開場與轉場動畫，使用 Stagger 效果製作搜尋結果的骨牌式進場。針對 React 生命週期，導入 useGSAP() 解決 React Strict Mode 下的動畫清理問題，並善用 clearProps 解決樣式殘留問題。在按鈕 Hover、 Focus 與 Modal 開關時使用 CSS Transition進行優化提升操作體驗。
            </p>              
          </li>
          <li className="li-style-test">
            <h4>AI Integration(AI 智慧功能導入與 API 整合)</h4>
            <p>
              <strong>TheMealDB API</strong>:<br/>串接外部公開資料庫，獲取標準化的食譜圖片與食材數據。
            </p>
            <p>
              <strong>Data Cleaning</strong>:<br/>透過撰寫 Helper Function 將TheMealDB資料庫回傳的資料進行標準化，(如 strIngredient1...20)轉換為乾淨的陣列結構。
            </p>
            <p>
              <strong>Google Gemini API</strong>:<br/>串接 gemini-2.0-flash 模型，利用生成式AI進行自然語言理解與食譜的邏輯判斷。<br />                
              <strong>Semantic Search(語意搜尋)</strong>:<br/> 將使用者的中文輸入或自然語言（如「我想吃雞肉料理」）轉換為標準化的英文食材關鍵字（如 chicken），以便查詢資料庫。<br />
              <strong>Dietary Analysis(飲食分析)</strong>:<br/> 分析食譜成分，判斷是否符合 Vegan (純素) 標準，並回傳 JSON 格式的分析報告。。
            </p>
            <p>
              <strong>RESTful API</strong>:<br/>使用 Fetch API 與 HTTP POST 方法，處理前端與AI模型及資料庫之間的資料傳輸。
            </p>   
            <p>
              <strong>Prompt Engineering</strong>:<br/>設定 System Instructions 與 AI 角色 (Persona)，並利用 JSON Mode 強制輸出標準化資料格式，確保前端渲染穩定性。
            </p>               
          </li>
          <li className="li-style-test">
            <h4>Optimization & DevOps(優化與部署)</h4>
            <p>
              <strong>Vercel Serverless Functions</strong>:<br/>透過Vercel的Serverless部署環境，建立 API Proxy 中間層，隱藏後端 API Key，解決 CORS 跨域問題並提升安全性。
            </p>
            <p>
              <strong>Environment Variables</strong>:<br/>透過使用 .env 檔案管理環境變數，確保敏感資訊不會暴露於前端程式碼中。
            </p>
            <p>
              <strong>PWA(Progressive Web App)</strong>:<br/>整合 vite-plugin-pwa 配置 Service Worker 與 Manifest 實現可安裝能力，打造類 Native APP 的體驗。
            </p>
            <p>
              <strong>SEO Optimization</strong>:<br/>使用 react-helmet-async 動態管理title、Meta標籤，確保每一頁食譜都有獨立的搜尋引擎描述與分享預覽。
            </p>
          </li>
        </ul>
        <div className="modal-button-wrapper">
          <button
            onClick={onClose}
            className="modal-button-style"
          >
            Got it!
          </button>
        </div>
      </div>
    </Modal>
  );
}
