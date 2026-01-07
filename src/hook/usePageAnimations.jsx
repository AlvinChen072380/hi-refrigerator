import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

/**
 * usePageAnimations Hook
 * 負責管理頁面上所有的 GSAP 動畫效果
 * * @param {Object} config - 設定物件
 * @param {React.RefObject} config.containerRef - 動畫作用範圍 (Scope)
 * @param {boolean} config.hasSearched - 是否已執行搜尋 (控制 Hero 高度)
 * @param {Array} config.displayRecipes - 目前要顯示的食譜列表 (控制卡片進場)
 * @param {boolean} config.loading - 載入狀態 (阻擋動畫)
 * @param {boolean} config.isAnalyzing - AI 分析狀態 (阻擋動畫)
 */

export function usePageAnimations ({
  containerRef,
  hasSearched,
  displayRecipes,
  loading,
  isAnalyzing
}) {

  const isFirstRender = useRef(true); //初次渲染標記

   //GSAP 2.useGASP 開始動畫(intro)
    useGSAP(
      () => {
        const tl = gsap.timeline();
  
        tl.from("header h1", {
          y: -50,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
        })
          .from(
            "header p",
            {
              y: 25,
              autoAlpha: 0,
              duration: 0.8,
            },
            "-=0.6"
          )
          .from(
            ".search-box",
            {
              scale: 0.8,
              autoAlpha: 0,
              duration: 0.8,
              ease: "back.out(1.7)",
            },
            "-=0.7"
          )
          .add(() => {
            //動畫結束後清除 inline style 避免干擾RWD
            gsap.set("header h1, header p, .search-box", {
              clearProps: "all",
            });
          });
      },
      { scope: containerRef }
    );
  
    //監聽hasSearched狀態來執行Hero Section動畫
    useGSAP(
      () => {
        if (isFirstRender.current) {
          isFirstRender.current = false;
          return;
        }
  
        if (hasSearched) {
          // 變小 (搜尋後)
          gsap.to(".hero-section", {
            minHeight: "180px",
            duration: 1.2,
            ease: "power3.inOut",
          });
          gsap.to("header h1", {
            scale: 0.8,            
            duration: 1.2,
            ease: "power3.inOut",
          });
        } else {
          // 變大(重置後)
          gsap.to(".hero-section", {
            minHeight: "100dvh",
            duration: 0.8,
            ease: "power3.inOut",
          });
          gsap.to("header h1", {
            scale: 1,           
            duration: 0.9,
            ease: "power3.inOut",
          });
        }
      },
      { scope: containerRef, dependencies: [hasSearched] }
    );   
  
    useGSAP(
      () => {
        if (loading || isAnalyzing || displayRecipes.length === 0) return;      
  
        const cards = gsap.utils.toArray(".recipe-card");
        if (cards.length === 0) return;
  
        gsap.killTweensOf(".recipe-card");
  
        gsap.set(".recipe-card", { clearProps: "all" });
  
        gsap.fromTo(
          ".recipe-card",
          {
            y: 50,
            autoAlpha: 0,
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.2,
            ease: "back.inOut(1.5)",
            onInterrupt: () => gsap.set(".recipe-card", { autoAlpha: 1 })
          }
        );
      },
      { 
        scope: containerRef, 
        dependencies: [displayRecipes, loading, isAnalyzing] 
      }
    );  

}