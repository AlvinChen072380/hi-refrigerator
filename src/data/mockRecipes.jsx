
export const MOCK_RECIPES = [
  {
    id: "1",
    strMeal: "鮮採實蔬沙拉",
    strMealThumb: "https://www.themealdb.com/images/media/meals/vpryqs1505411719.jpg",
    veganCategory: "vegan",
    aiTags: ["全素","高纖","低卡"],
    description: "清爽的時蔬搭配油醋醬，無任何動物性成分。",
  },
  {
    id: "2",
    strMeal: "經典奶油培根義大利麵",
    strMealThumb: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
    veganCategory: "non-vegetarian", // 非素食 (等一下要被過濾掉的)
    aiTags: ["培根", "鮮奶油", "高熱量"],
    description: "濃郁白醬與煙燻培根的經典組合。",
  },
  {
    id: "3",
    strMeal: "麻婆豆腐 (素)",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1529446352.jpg",
    veganCategory: "five-pungent", // 五辛素
    aiTags: ["五辛素", "花椒", "下飯"],
    description: "使用植物肉與辣椒花椒拌炒，含蔥蒜。",
  },
  {
    id: "4",
    strMeal: "滑蛋番茄",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1549542994.jpg",
    veganCategory: "ovo", // 蛋素
    aiTags: ["蛋素", "蛋白質", "家常菜"],
    description: "軟嫩雞蛋與酸甜番茄的完美融合。",
  },
];