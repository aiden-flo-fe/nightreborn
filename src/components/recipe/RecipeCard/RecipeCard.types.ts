import type { Recipe, Category } from '~/types';

export interface RecipeCardProps {
  recipe: Recipe;
  category?: Category;
  onClick: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
}
