

//定義AI目標資料結構

export interface AiEnrichedRecipe {
  //localization
  id: string;
  title_en: string;
  title_zh: string;
  description_sh: string;

  //structuring ingredients
  ingredients: {
    item: string;
    amount: string;
    original_text: string;
  }[];

  //structuring steps
  steps: {
    step_number: number;
    content: string;
    action_tag?: string;
  }[];

  //add extra nutrition info
  nutrition_estimate: {
    calories: number;
    protein: string;
    carbon: string;
  };

  tags: string[]; //Ai tags

  difficulty: "簡單" | "中等" | "困難";
  
  time_estimate: string;
}