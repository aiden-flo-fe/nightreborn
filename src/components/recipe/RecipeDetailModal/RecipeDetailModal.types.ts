import type { Recipe } from '~/types';

export interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}
