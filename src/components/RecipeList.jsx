import RecipeCard from "../RecipeCard";

export default function RecipeList({
  loading,
  error,
  isAnalyzing,
  currentDisplayRecipes,
  handleShowDetails,
}) {
  if (loading || error || isAnalyzing || currentDisplayRecipes.length === 0) {
    return null;
  }

  return (
    <section className="recipe-grid results-container">
      {currentDisplayRecipes.map((meal) => (
        <RecipeCard
          key={meal.idMeal}
          meal={meal}
          handleShowDetails={handleShowDetails}
        />
      ))}
    </section>
  );
}
