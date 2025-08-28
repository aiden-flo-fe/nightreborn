import type { Category, Ingredient } from '~/types';

export interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
  editRecipe?: any; // 편집 모드일 때 전달되는 레시피
}

export interface RecipeFormData {
  title: string;
  photo?: string;
  categoryId: string | null;
  ingredients: Ingredient[];
}
