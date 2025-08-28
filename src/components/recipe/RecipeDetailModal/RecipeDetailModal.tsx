import React, { useState } from 'react';
import { Modal } from '~/components/common';
import {
  DetailContainer,
  RecipeHeader,
  RecipeImage,
  RecipeInfo,
  RecipeTitle,
  ServingSection,
  ServingButtonGroup,
  ServingButton,
  DirectInputButton,
  ServingInput,
  ServingInputGroup,
  IngredientSection,
  IngredientTitle,
  IngredientList,
  IngredientItem,
  IngredientName,
  IngredientAmount,
} from './RecipeDetailModal.styled';
import type { RecipeDetailModalProps } from './RecipeDetailModal.types';
import { calculateIngredientAmount } from '~/utils';

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  onClose,
  recipe,
}) => {
  const [servings, setServings] = useState<number>(1);
  const [isDirectInput, setIsDirectInput] = useState<boolean>(false);

  // 미리 정의된 인분 옵션
  const servingOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4];

  const handleServingButtonClick = (value: number) => {
    setServings(value);
    setIsDirectInput(false);
  };

  const handleDirectInputToggle = () => {
    setIsDirectInput(!isDirectInput);
  };

  const handleServingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 1;
    setServings(Math.max(0.5, value)); // 최소 0.1인분
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="레시피 상세" size="large">
      <DetailContainer>
        <RecipeHeader>
          <RecipeImage src={recipe.photo} />
          <RecipeInfo>
            <RecipeTitle>{recipe.title}</RecipeTitle>
            <ServingSection>
              <ServingButtonGroup>
                {servingOptions.map(option => (
                  <ServingButton
                    key={option}
                    active={!isDirectInput && servings === option}
                    onClick={() => handleServingButtonClick(option)}
                  >
                    {option}인분
                  </ServingButton>
                ))}
                <DirectInputButton
                  active={isDirectInput}
                  onClick={handleDirectInputToggle}
                >
                  직접입력
                </DirectInputButton>
              </ServingButtonGroup>

              {isDirectInput && (
                <ServingInputGroup>
                  <ServingInput
                    type="number"
                    value={servings}
                    onChange={handleServingsChange}
                    min="0.5"
                    step="0.5"
                    placeholder="인분 입력"
                  />
                  <span>인분</span>
                </ServingInputGroup>
              )}
            </ServingSection>
          </RecipeInfo>
        </RecipeHeader>

        <IngredientSection>
          <IngredientTitle>재료</IngredientTitle>
          <IngredientList>
            {recipe.ingredients.map(ingredient => (
              <IngredientItem key={ingredient.id}>
                <IngredientName>{ingredient.name}</IngredientName>
                <IngredientAmount>
                  {calculateIngredientAmount(ingredient, servings)}
                </IngredientAmount>
              </IngredientItem>
            ))}
          </IngredientList>
        </IngredientSection>
      </DetailContainer>
    </Modal>
  );
};

export default RecipeDetailModal;
