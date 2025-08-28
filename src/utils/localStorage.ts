import type { AppData, Category, Recipe } from '~/types';

const STORAGE_KEY = 'recipe-app-data';

export const getStorageData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { categories: [], recipes: [] };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('로컬 스토리지 데이터를 읽는 중 오류가 발생했습니다:', error);
    return { categories: [], recipes: [] };
  }
};

export const saveStorageData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error(
      '로컬 스토리지에 데이터를 저장하는 중 오류가 발생했습니다:',
      error
    );
  }
};

export const saveCategories = (categories: Category[]): void => {
  const data = getStorageData();
  data.categories = categories;
  saveStorageData(data);
};

export const saveRecipes = (recipes: Recipe[]): void => {
  const data = getStorageData();
  data.recipes = recipes;
  saveStorageData(data);
};

export const saveCategory = (category: Category): void => {
  const data = getStorageData();
  const existingIndex = data.categories.findIndex(c => c.id === category.id);

  if (existingIndex >= 0) {
    data.categories[existingIndex] = category;
  } else {
    data.categories.push(category);
  }

  saveStorageData(data);
};

export const deleteCategory = (categoryId: string): void => {
  const data = getStorageData();
  data.categories = data.categories.filter(c => c.id !== categoryId);
  // 해당 카테고리의 레시피들도 categoryId를 null로 변경
  data.recipes = data.recipes.map(recipe =>
    recipe.categoryId === categoryId ? { ...recipe, categoryId: null } : recipe
  );
  saveStorageData(data);
};

export const saveRecipe = (recipe: Recipe): void => {
  const data = getStorageData();
  const existingIndex = data.recipes.findIndex(r => r.id === recipe.id);

  if (existingIndex >= 0) {
    data.recipes[existingIndex] = recipe;
  } else {
    data.recipes.push(recipe);
  }

  saveStorageData(data);
};

export const deleteRecipe = (recipeId: string): void => {
  const data = getStorageData();
  data.recipes = data.recipes.filter(r => r.id !== recipeId);
  saveStorageData(data);
};

// 데이터 내보내기/가져오기 기능
export const exportData = (): string => {
  const data = getStorageData();
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data: AppData = JSON.parse(jsonString);

    // 데이터 유효성 검사
    if (!Array.isArray(data.categories) || !Array.isArray(data.recipes)) {
      throw new Error('유효하지 않은 데이터 형식입니다.');
    }

    saveStorageData(data);
    return true;
  } catch (error) {
    console.error('데이터 가져오기 실패:', error);
    return false;
  }
};
