import type { Recipe, Category } from '~/types';

export interface RecipeListProps {
  categories: Category[];
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  onRecipeEdit?: (recipe: Recipe) => void;
  onRecipeDelete?: (recipe: Recipe) => void;
  onRecipeReorder?: (recipes: Recipe[]) => void;
  onCategorySettings: ({
    isOpen,
    sortMode,
  }: {
    isOpen: boolean;
    sortMode: boolean;
  }) => void;
}
