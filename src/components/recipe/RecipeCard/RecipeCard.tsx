import React from 'react';
import {
  CardContainer,
  RecipeImage,
  RecipeTitle,
  CategoryRow,
  CategoryBadge,
  ActionButtons,
  EditButton,
  DeleteButton,
  IngredientCount,
} from './RecipeCard.styled';
import type { RecipeCardProps } from './RecipeCard.types';

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  category,
  onClick,
  onEdit,
  onDelete,
}) => {
  const handleClick = () => {
    onClick(recipe);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation(); // 카드 클릭 이벤트 방지
    if (onEdit) {
      onEdit(recipe);
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // 카드 클릭 이벤트 방지
    if (onDelete) {
      onDelete(recipe);
    }
  };

  return (
    <CardContainer onClick={handleClick}>
      <RecipeImage src={recipe.photo} />
      <div>
        <CategoryRow>
          {category && <CategoryBadge>{category.name}</CategoryBadge>}
          {(onEdit || onDelete) && (
            <ActionButtons>
              {onEdit && (
                <EditButton onClick={handleEdit} title="레시피 수정">
                  수정
                </EditButton>
              )}
              {onDelete && (
                <DeleteButton onClick={handleDelete} title="레시피 삭제">
                  삭제
                </DeleteButton>
              )}
            </ActionButtons>
          )}
        </CategoryRow>
        <RecipeTitle>{recipe.title}</RecipeTitle>
        <IngredientCount>재료 {recipe.ingredients.length}개</IngredientCount>
      </div>
    </CardContainer>
  );
};

export default RecipeCard;
