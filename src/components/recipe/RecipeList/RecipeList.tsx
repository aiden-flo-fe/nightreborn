import React, { useMemo, useState } from 'react';
import { Button, DraggableList } from '~/components/common';
import RecipeCard from '~/components/recipe/RecipeCard/RecipeCard';
import {
  ListContainer,
  CategorySection,
  CategoryHeader,
  CategoryTitle,
  RecipeCount,
  ButtonGroup,
  RecipeGrid,
  EmptyMessage,
  NoRecipesMessage,
  SortModeInfo,
} from './RecipeList.styled';
import type { RecipeListProps } from './RecipeList.types';
import type { Recipe } from '~/types';

const RecipeList: React.FC<RecipeListProps> = ({
  categories,
  recipes,
  onRecipeClick,
  onRecipeEdit,
  onRecipeDelete,
  onRecipeReorder,
  onCategorySettings,
}) => {
  // 정렬 모드 상태
  const [sortingCategoryId, setSortingCategoryId] = useState<string | null>(
    null
  );
  // 카테고리별 레시피 그룹화
  const groupedRecipes = useMemo(() => {
    const grouped: { [key: string]: Recipe[] } = {};

    // 카테고리가 있는 레시피들을 그룹화
    categories.forEach(category => {
      grouped[category.id] = recipes
        .filter(recipe => recipe.categoryId === category.id)
        .sort((a, b) => a.order - b.order);
    });

    // 카테고리가 없는 레시피들
    const uncategorizedRecipes = recipes
      .filter(recipe => !recipe.categoryId)
      .sort((a, b) => a.order - b.order);

    if (uncategorizedRecipes.length > 0) {
      grouped['uncategorized'] = uncategorizedRecipes;
    }

    return grouped;
  }, [categories, recipes]);

  // 카테고리 정렬 버튼 클릭
  const handleSortCategories = () => {
    onCategorySettings({
      isOpen: true,
      sortMode: true,
    });
  };

  // 레시피 정렬 버튼 클릭
  const handleSortRecipes = (categoryId: string) => {
    setSortingCategoryId(categoryId);
  };

  // 레시피 정렬 모드 종료
  const handleSortEnd = () => {
    setSortingCategoryId(null);
  };

  // 레시피 순서 변경 처리
  const handleRecipeReorder = (reorderedRecipes: Recipe[]) => {
    if (onRecipeReorder) {
      // 전체 레시피 목록에서 해당 카테고리의 레시피들을 업데이트
      const otherRecipes = recipes.filter(recipe =>
        sortingCategoryId === 'uncategorized'
          ? recipe.categoryId !== null
          : recipe.categoryId !== sortingCategoryId
      );

      const allRecipes = [...otherRecipes, ...reorderedRecipes];
      onRecipeReorder(allRecipes);
    }
  };

  if (categories.length === 0 && recipes.length === 0) {
    return (
      <EmptyMessage>
        <div>아직 레시피가 없습니다.</div>
        <div>첫 번째 레시피를 추가해보세요! 🍳</div>
      </EmptyMessage>
    );
  }

  return (
    <ListContainer>
      {/* 전체 카테고리 정렬 버튼 */}
      {categories.length > 0 && (
        <CategoryHeader>
          <CategoryTitle>전체 레시피</CategoryTitle>
          <Button
            variant="secondary"
            size="small"
            onClick={handleSortCategories}
          >
            카테고리 정렬하기
          </Button>
        </CategoryHeader>
      )}

      {/* 카테고리별 레시피 섹션들 */}
      {categories.map(category => {
        const categoryRecipes = groupedRecipes[category.id] || [];

        return (
          <CategorySection key={category.id}>
            <CategoryHeader>
              <CategoryTitle>
                {category.name}
                <RecipeCount>({categoryRecipes.length})</RecipeCount>
              </CategoryTitle>
              <ButtonGroup>
                {sortingCategoryId === category.id ? (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleSortEnd}
                  >
                    정렬 완료
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleSortRecipes(category.id)}
                  >
                    레시피 정렬
                  </Button>
                )}
              </ButtonGroup>
            </CategoryHeader>

            {categoryRecipes.length > 0 ? (
              sortingCategoryId === category.id ? (
                // 정렬 모드 - DraggableList 사용
                <>
                  <SortModeInfo>
                    레시피를 드래그해서 순서를 변경하세요. 완료되면 '정렬 완료'
                    버튼을 클릭하세요.
                  </SortModeInfo>
                  <DraggableList
                    items={categoryRecipes}
                    onReorder={handleRecipeReorder}
                    renderItem={(recipe, _index, isDragging) => (
                      <div style={{ opacity: isDragging ? 0.5 : 1 }}>
                        <RecipeCard
                          recipe={recipe}
                          category={category}
                          onClick={() => {}} // 정렬 모드에서는 클릭 비활성화
                        />
                      </div>
                    )}
                  />
                </>
              ) : (
                // 일반 모드 - RecipeGrid 사용
                <RecipeGrid>
                  {categoryRecipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      category={category}
                      onClick={onRecipeClick}
                      onEdit={onRecipeEdit}
                      onDelete={onRecipeDelete}
                    />
                  ))}
                </RecipeGrid>
              )
            ) : (
              <NoRecipesMessage>
                이 카테고리에는 아직 레시피가 없습니다.
              </NoRecipesMessage>
            )}
          </CategorySection>
        );
      })}

      {/* 카테고리가 없는 레시피들 */}
      {groupedRecipes['uncategorized'] && (
        <CategorySection>
          <CategoryHeader>
            <CategoryTitle>
              기타
              <RecipeCount>
                ({groupedRecipes['uncategorized'].length})
              </RecipeCount>
            </CategoryTitle>
            <ButtonGroup>
              {sortingCategoryId === 'uncategorized' ? (
                <Button variant="primary" size="small" onClick={handleSortEnd}>
                  정렬 완료
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleSortRecipes('uncategorized')}
                >
                  레시피 정렬
                </Button>
              )}
            </ButtonGroup>
          </CategoryHeader>

          {sortingCategoryId === 'uncategorized' ? (
            // 정렬 모드 - DraggableList 사용
            <>
              <SortModeInfo>
                레시피를 드래그해서 순서를 변경하세요. 완료되면 '정렬 완료'
                버튼을 클릭하세요.
              </SortModeInfo>
              <DraggableList
                items={groupedRecipes['uncategorized']}
                onReorder={handleRecipeReorder}
                renderItem={(recipe, _index, isDragging) => (
                  <div style={{ opacity: isDragging ? 0.5 : 1 }}>
                    <RecipeCard
                      recipe={recipe}
                      onClick={() => {}} // 정렬 모드에서는 클릭 비활성화
                    />
                  </div>
                )}
              />
            </>
          ) : (
            // 일반 모드 - RecipeGrid 사용
            <RecipeGrid>
              {groupedRecipes['uncategorized'].map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={onRecipeClick}
                  onEdit={onRecipeEdit}
                  onDelete={onRecipeDelete}
                />
              ))}
            </RecipeGrid>
          )}
        </CategorySection>
      )}
    </ListContainer>
  );
};

export default RecipeList;
