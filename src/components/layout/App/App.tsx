import React, { useState, useEffect } from 'react';
import Header from '~/components/layout/Header/Header';
import Content from '~/components/layout/Content/Content';
import RecipeList from '~/components/recipe/RecipeList/RecipeList';
import AddRecipeModal from '~/components/recipe/AddRecipeModal/AddRecipeModal';
import RecipeDetailModal from '~/components/recipe/RecipeDetailModal/RecipeDetailModal';
import CategorySettingsModal from '~/components/category/CategorySettingsModal/CategorySettingsModal';
import { AppContainer } from './App.styled';
import type { Recipe, Category } from '~/types';
import {
  getStorageData,
  deleteRecipe,
  saveRecipes,
} from '~/utils/localStorage';
import { sortCategoriesByOrder, sortRecipesByOrder, confirm } from '~/utils';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // 모달 상태들
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isRecipeDetailModalOpen, setIsRecipeDetailModalOpen] = useState(false);
  const [isCategorySettingsModalOpen, setIsCategorySettingsModalOpen] =
    useState({
      isOpen: false,
      sortMode: false,
    });

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const data = getStorageData();
    setCategories(sortCategoriesByOrder(data.categories));
    setRecipes(sortRecipesByOrder(data.recipes));
  }, []);

  // 레시피 추가 모달 열기
  const handleAddRecipe = () => {
    setEditRecipe(null); // 새 레시피 추가 모드
    setIsAddRecipeModalOpen(true);
  };

  // 카테고리 설정 모달 열기
  const handleCategorySettings = ({
    isOpen,
    sortMode,
  }: {
    isOpen: boolean;
    sortMode: boolean;
  }) => {
    setIsCategorySettingsModalOpen({
      isOpen,
      sortMode,
    });
  };

  // 레시피 상세보기
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeDetailModalOpen(true);
  };

  // 레시피 수정 핸들러
  const handleRecipeEdit = (recipe: Recipe) => {
    setEditRecipe(recipe);
    setIsAddRecipeModalOpen(true);
  };

  // 레시피 삭제 핸들러
  const handleRecipeDelete = async (recipe: Recipe) => {
    const isConfirmed = await confirm(
      `"${recipe.title}" 레시피를 삭제하시겠습니까?`
    );

    if (isConfirmed) {
      deleteRecipe(recipe.id);
      handleDataUpdate();
    }
  };

  // 레시피 순서 변경 핸들러
  const handleRecipeReorder = (reorderedRecipes: Recipe[]) => {
    saveRecipes(reorderedRecipes);
    setRecipes(sortRecipesByOrder(reorderedRecipes));
  };

  // 데이터 업데이트 핸들러들
  const handleDataUpdate = () => {
    const data = getStorageData();
    setCategories(sortCategoriesByOrder(data.categories));
    setRecipes(sortRecipesByOrder(data.recipes));
  };

  return (
    <AppContainer>
      <Header
        onAddRecipe={handleAddRecipe}
        onCategorySettings={() =>
          handleCategorySettings({
            isOpen: true,
            sortMode: false,
          })
        }
      />
      <Content>
        <RecipeList
          categories={categories}
          recipes={recipes}
          onRecipeClick={handleRecipeClick}
          onRecipeEdit={handleRecipeEdit}
          onRecipeDelete={handleRecipeDelete}
          onRecipeReorder={handleRecipeReorder}
          onCategorySettings={handleCategorySettings}
        />
      </Content>

      {/* 모달들 */}
      <AddRecipeModal
        key={`add-recipe-${isAddRecipeModalOpen ? Date.now() : 'closed'}`}
        isOpen={isAddRecipeModalOpen}
        onClose={() => {
          setIsAddRecipeModalOpen(false);
          setEditRecipe(null);
        }}
        categories={categories}
        editRecipe={editRecipe}
        onSuccess={handleDataUpdate}
      />

      {selectedRecipe && (
        <RecipeDetailModal
          key={`recipe-detail-${selectedRecipe.id}-${isRecipeDetailModalOpen ? Date.now() : 'closed'}`}
          isOpen={isRecipeDetailModalOpen}
          onClose={() => setIsRecipeDetailModalOpen(false)}
          recipe={selectedRecipe}
        />
      )}

      <CategorySettingsModal
        key={`category-settings-${isCategorySettingsModalOpen.isOpen ? Date.now() : 'closed'}`}
        isOpen={isCategorySettingsModalOpen.isOpen}
        onClose={() =>
          handleCategorySettings({
            isOpen: false,
            sortMode: false,
          })
        }
        categories={categories}
        onSuccess={handleDataUpdate}
        sortMode={isCategorySettingsModalOpen.sortMode}
      />
    </AppContainer>
  );
};

export default App;
