import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* 透過Destructuring 直接拿出 meal 這個屬性 */
function RecipeCard({ meal }) {

  /* 為了易毒性與維護性，將按鈕點擊所需的 ID 統一管理 */
  const { idMeal, strMeal, strMealThumb, strCategory, strArea } = meal;

  //紀錄圖片加載是否失敗
  const [imgError, setImgError] = useState(false);
  //加載失敗時的預設圖片
  const fallbackImage = "https://placehold.co/600x400?text=No+Image";

  const navigate = useNavigate();
  const location = useLocation();

  const handleCardClick = () => {
    // 導航到食譜頁面，同時偷偷把「現在的首頁」當作背景傳遞過去
    navigate(`/recipe/${idMeal}`, { state: { background: location } });
  };

  return (
    <div 
      className="recipe-card"
      onClick={handleCardClick}
    >
      <img 
        src={imgError ? fallbackImage : strMealThumb} 
        alt={strMeal} 
        onError={() => setImgError(true)}
        loading="lazy" /* 瀏覽器原生 Lazy Loading */
      />
      <h3>{strMeal}</h3>
      <p>
        Category : {strCategory}
        <br />
        Area : {strArea}
      </p>

      <button data-id={idMeal}>
        Let's Cook !
      </button>
    </div>
  );
}

export default RecipeCard;
