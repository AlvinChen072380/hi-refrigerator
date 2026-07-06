import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import RecipeModal from "./RecipeModal";

export default function RecipeModalWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: meal, isLoading } = useQuery({
    queryKey: ['recipeDetail', id],
    queryFn: async () => {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const handleClose = () => {
    navigate(-1);
  };

  // 在資料還沒回來前，先顯示一個沒有動畫的黑色遮罩與 Loading，
  // 避免 RecipeModal 提早掛載導致 GSAP 動畫在 Loading 結束時發生「跳動」
  if (isLoading || !meal) {
    return (
      <div className="modal" onClick={handleClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>Loading recipe...</div>
      </div>
    );
  }

  // 資料回來後，才真正掛載 RecipeModal，此時 GSAP 進場動畫才會完美執行一次
  return <RecipeModal meal={meal} loading={false} onClose={handleClose} />;
}
