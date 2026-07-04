import { useState, useEffect } from "react";

// -- Helper Function: 食材資料格式轉換 --
const getIngredients = (meal) => {
  if (!meal) return [];

  let ingredients = [];
  //API 最多提供20種食材與份量，利用迴圈來取得
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    //如果食材欄位有值且不是空的，就加進陣列
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push({
        id: i, //先使用數字當作臨時ID
        text: ingredient,
        measure: measure,
        isCompleted: false, //購物清單預設未採買狀態
        isHidden: false, //預設不需要購買食材的隱藏
      });
    }
  }
  return ingredients;
};

export function useShoppingList(meal) {
  const [ingredients, setIngredients] = useState(() => {
    // 直接在這裡做初始讀取，不用 useEffect 來 set
    if (!meal) return [];
    const saved = localStorage.getItem(`shopping-list-${meal.idMeal}`);
    return saved ? JSON.parse(saved) : getIngredients(meal);
  });

  // 自動存檔機制
  // 只要ingredients 有任何更動，就自動存檔
  useEffect(() => {
    if (!meal) return;

    if (ingredients.length > 0) {
      localStorage.setItem(
        `shopping-list-${meal.idMeal}`,
        JSON.stringify(ingredients),
      );
    }
  }, [ingredients, meal]);

  // 互動函式:切換完成狀態(打勾/取消)
  const toggleIngredient = (id) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    );
  };

  // 互動函式:軟刪除(隱藏)食材清單功能
  const archiveIngredient = (id) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isHidden: true } : item,
      ),
    );
  };

  // 互動函式:復原所有隱藏項目
  const restoreAll = () => {
    setIngredients((prev) =>
      prev.map((item) => (item.isHidden ? { ...item, isHidden: false } : item)),
    );
  };

  const hasHiddenItems = ingredients.some((item) => item.isHidden); //判斷是否有隱藏項目

  // 互動函式:重置清單
  const resetList = () => {
    if (window.confirm("Are you sure to reset? All record will be erased.")) {
      setIngredients(getIngredients(meal));
    }
  };

  // 新增複製清單功能
  const copyToClipboard = () => {
    //1.過濾出 沒被刪除的食材
    const textToCopy = ingredients
      .filter((item) => !item.isHidden)
      .map((item) => {
        //2.格式化文字: [v] 雞蛋 (2顆)
        const check = item.isCompleted ? "[v]" : "[ ]";
        return `${check} ${item.text} (${item.measure})`;
      })
      .join("\n"); //換行
    //3.加上標題
    const finalContent = `${meal.strMeal} - 採買清單:\n\n${textToCopy}`;
    //4.寫入剪貼簿
    navigator.clipboard
      .writeText(finalContent)
      .then(() => alert("List is ready on clipboard"))
      .catch((err) => console.error("copy error", err));
  };

  return {
    ingredients,
    getIngredients,
    toggleIngredient,
    archiveIngredient,
    restoreAll,
    hasHiddenItems,
    resetList,
    copyToClipboard,
  };
}
