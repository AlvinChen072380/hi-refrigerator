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
    // Go back to the background page instead of just clearing local state
    navigate(-1);
  };

  return <RecipeModal meal={meal} loading={isLoading} onClose={handleClose} />;
}
