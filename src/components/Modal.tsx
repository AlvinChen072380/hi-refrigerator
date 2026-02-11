
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-[95vw]",
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: MaxWidth; 
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
}: ModalProps) {
  // 1.解決SSR問題: 確保只在Client 端渲染
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
      // 當 Modal 打開時，鎖住背景滾動 (Body Lock)
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function: 關閉時恢復滾動
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen])  

  // 如果沒掛載或是沒打開，就不渲染任何東西
  if (!mounted /* || !isOpen */) return null; //!isOpen 會干擾動畫運作 Early Return

  // 2.傳送門核心: createPortal(JSX, 目標 DOM)
  // 這裡我們直接傳送到 document.body
  return createPortal(

    <AnimatePresence>
      {isOpen && (
    <>
      {/* 背景遮罩 (Overlay) - 點擊背景關閉 */}
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="modal-overlay-tech"
        onClick={onClose}
      />

      {/* Modal 本體 - 居中顯示 */}
      <div className="modal-wrapper-tech">{/* pointer-events-none 的意思是：
          「我是透明人，滑鼠點擊請穿過我，去點後面的東西（也就是上面的背景遮罩）」
          這解決了「點背景沒反應」的問題。
      */}
        <motion.div
          key="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          
          className={`modal-content-tech ${maxWidthClasses[maxWidth]}`}

          // 阻止點擊本體時觸發背景關閉 (冒泡)
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header-tech">
            <h3 className="modal-title-tech">
              {title || "Info"}
            </h3>
            {/* <button
              onClick={onClose}
              aria-label="Close"
              className="close-btn"
            >
              <X size={20} color="#6b7280" />
            </button> */}
          </div>

          {/* Content */}
          <div className="modal-body-tech">{children}</div>
        </motion.div>
      </div>
    </>
    )}
    </AnimatePresence>,
    document.body // 傳送目的地(參考google文件說明)
  );
}
