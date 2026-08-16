export interface HomeRecipe {
  id: number | string;
  category: string;
  title: string;
  author: string;
  avatar: string;
  image: string;
  time: string;
  difficulty: string;
  rating: number;
  likes: string;
  comments: number;
}

export interface MatchRecipe {
  title: string;
  desc: string;
  image: string;
  time: string;
  difficulty: string;
  servings: string;
}

export interface MealPlanItem {
  id: string;
  day: string;
  type: string;
  title: string;
  image: string;
}

export interface BackupMeal {
  title: string;
  image: string;
}

export interface HomeReview {
  id: number | string;
  image: string;
  dishName: string;
  recipeName: string;
  username: string;
  time: string;
  text: string;
  likes: number;
  comments: number;
  avatar: string;
}

export interface ToastState {
  message: string;
  visible: boolean;
  type: "success" | "warning" | "info" | "error";
}
