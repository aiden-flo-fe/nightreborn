import React, { useState, useCallback } from 'react';
import { Modal, Button, Input, Label } from '~/components/common';
import {
  FormContainer,
  FormRow,
  HorizontalFormRow,
  PhotoPreview,
  RemovePhotoButton,
  CategorySection,
  CategorySelect,
  IngredientSection,
  IngredientHeader,
  IngredientTitle,
  IngredientList,
  IngredientItem,
  IngredientInputGroup,
  AmountInputGroup,
  RemoveIngredientButton,
  ButtonRow,
  ErrorMessage,
} from '~/components/recipe/AddRecipeModal/AddRecipeModal.styled';
import type {
  AddRecipeModalProps,
  RecipeFormData,
} from '~/components/recipe/AddRecipeModal/AddRecipeModal.types';
import type { Ingredient } from '~/types';
import {
  generateId,
  getCurrentTime,
  parseAmount,
  fileToBase64,
  confirm,
} from '~/utils';
import { saveRecipe } from '~/utils/localStorage';

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
  editRecipe,
}) => {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: editRecipe?.title || '',
    photo: editRecipe?.photo || undefined,
    categoryId: editRecipe?.categoryId || null,
    ingredients: editRecipe?.ingredients || [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 필드 변경 핸들러
  const handleFieldChange = useCallback(
    (
      field: keyof RecipeFormData,
      value: string | number | null | undefined | Ingredient[]
    ) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));

      // 에러 클리어
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // 사진 업로드 핸들러
  const handlePhotoChange = useCallback(
    async (file: File | null) => {
      if (file) {
        try {
          const base64 = await fileToBase64(file);
          handleFieldChange('photo', base64);
        } catch (error) {
          console.error('사진 업로드 실패:', error);
          setErrors(prev => ({
            ...prev,
            photo: '사진 업로드에 실패했습니다.',
          }));
        }
      }
    },
    [handleFieldChange]
  );

  // 사진 제거 핸들러
  const handleRemovePhoto = () => {
    handleFieldChange('photo', undefined);
  };

  // 재료 추가
  const handleAddIngredient = () => {
    const newIngredient: Ingredient[] =
      formData.ingredients.length === 0
        ? Array.from({ length: 12 }, () => ({
            id: generateId(),
            name: '',
            amountNumber: null,
            amountUnit: null,
          }))
        : [
            {
              id: generateId(),
              name: '',
              amountNumber: null,
              amountUnit: null,
            },
          ];

    handleFieldChange('ingredients', [
      ...formData.ingredients,
      ...newIngredient,
    ]);
  };

  // 재료 수정
  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number | null | undefined
  ) => {
    const newIngredients = [...formData.ingredients];

    if (field === 'name') {
      newIngredients[index] = {
        ...newIngredients[index],
        name: value as string,
      };
    } else if (field === 'amountNumber' || field === 'amountUnit') {
      // amount 입력 처리
      const amountString = value as string;
      const parsed = parseAmount(amountString);
      newIngredients[index] = {
        ...newIngredients[index],
        amountNumber: parsed.amountNumber,
        amountUnit: parsed.amountUnit,
      };
    }

    handleFieldChange('ingredients', newIngredients as Ingredient[]);
  };

  // 재료 삭제
  const handleRemoveIngredient = (index: number) => {
    if (confirm('이 재료를 삭제하시겠습니까?')) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      handleFieldChange('ingredients', newIngredients as Ingredient[]);
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = '레시피 제목을 입력해주세요.';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '카테고리를 선택해주세요.';
    }

    // 완전히 비어있는 재료 항목들을 필터링 (name, amountNumber, amountUnit이 모두 비어있는 경우)
    const filteredIngredients = formData.ingredients.filter(ingredient => {
      const hasName = ingredient.name.trim() !== '';
      const hasAmount =
        ingredient.amountNumber !== undefined &&
        ingredient.amountNumber !== null &&
        ingredient.amountNumber > 0;
      const hasUnit = ingredient.amountUnit?.trim() !== '';

      // 하나라도 입력되어 있으면 포함
      return hasName || hasAmount || hasUnit;
    });

    if (filteredIngredients.length === 0) {
      newErrors.ingredients = '재료를 최소 1개 이상 추가해주세요.';
    } else {
      // 필터링된 재료들에 대해 유효성 검사 (부분 입력된 재료들 체크)
      const hasIncompleteIngredient = filteredIngredients.some(ingredient => {
        const hasName = ingredient.name.trim() !== '';
        const hasAmount =
          ingredient.amountNumber !== undefined &&
          ingredient.amountNumber !== null &&
          ingredient.amountNumber > 0;
        const hasUnit = ingredient.amountUnit?.trim() !== '';

        // 하나만 입력되고 나머지는 비어있는 경우를 찾음
        return (
          (hasName && !hasAmount && !hasUnit) ||
          (!hasName && (hasAmount || hasUnit)) ||
          (!hasName && hasAmount && hasUnit)
        );
      });

      if (hasIncompleteIngredient) {
        newErrors.ingredients = '모든 재료의 이름, 수량, 단위를 입력해주세요.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const excuteResetAndClose = () => {
    resetForm();
    onClose();
  };

  // 폼 제출
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const maxOrder = formData.categoryId
        ? Math.max(
            ...categories
              .filter(r => r.id === formData.categoryId)
              .map(r => r.order),
            0
          )
        : 0;

      // 완전히 비어있는 재료 항목들을 필터링해서 저장
      const filteredIngredients = formData.ingredients.filter(ingredient => {
        const hasName = ingredient.name.trim() !== '';
        const hasAmount =
          ingredient.amountNumber !== undefined &&
          ingredient.amountNumber !== null &&
          ingredient.amountNumber > 0;
        const hasUnit = ingredient.amountUnit?.trim() !== '';

        // 하나라도 입력되어 있으면 포함
        return hasName || hasAmount || hasUnit;
      });

      const recipe = {
        id: editRecipe?.id || generateId(),
        title: formData.title.trim(),
        photo: formData.photo,
        categoryId: formData.categoryId,
        ingredients: filteredIngredients,
        order: editRecipe?.order || maxOrder + 1,
        createdAt: editRecipe?.createdAt || getCurrentTime(),
        updatedAt: getCurrentTime(),
      };

      saveRecipe(recipe);
      onSuccess();
      excuteResetAndClose();
    } catch (error) {
      console.error('레시피 저장 실패:', error);
      setErrors({ submit: '레시피 저장에 실패했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    if (formData.title || formData.ingredients.length > 0) {
      if (confirm('레시피 입력을 취소하시겠습니까?')) {
        excuteResetAndClose();
      }
    } else {
      excuteResetAndClose();
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: '',
      photo: undefined,
      categoryId: null,
      ingredients: [],
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const getAmountDisplayValue = (ingredient: Ingredient): string => {
    if (ingredient.amountNumber !== null && ingredient.amountUnit) {
      return `${ingredient.amountNumber}${ingredient.amountUnit}`;
    } else if (ingredient.amountNumber !== null) {
      return ingredient.amountNumber.toString();
    } else if (ingredient.amountUnit) {
      return ingredient.amountUnit;
    }
    return '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editRecipe ? '레시피 수정' : '새 레시피 추가'}
      size="large"
    >
      <FormContainer>
        {/* 레시피 제목과 카테고리 */}
        <HorizontalFormRow>
          <Input
            label="레시피 제목"
            value={formData.title}
            placeholder="레시피 제목을 입력하세요"
            onChange={value => handleFieldChange('title', value)}
            onEnterPress={handleAddIngredient}
            error={errors.title}
            required
            fullWidth
          />
          <CategorySection>
            <Label required>카테고리</Label>
            <CategorySelect
              value={formData.categoryId || ''}
              onChange={e =>
                handleFieldChange('categoryId', e.target.value || null)
              }
            >
              <option value="">카테고리 선택</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </CategorySelect>
            {errors.categoryId && (
              <div
                style={{
                  color: '#dc3545',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                }}
              >
                {errors.categoryId}
              </div>
            )}
          </CategorySection>
        </HorizontalFormRow>

        {/* 재료 섹션 */}
        <IngredientSection>
          <IngredientHeader>
            <IngredientTitle>재료 (1인분 기준)</IngredientTitle>
            <Button
              variant="primary"
              size="medium"
              onClick={handleAddIngredient}
            >
              재료 추가
            </Button>
          </IngredientHeader>

          {formData.ingredients.length === 0 ? (
            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
              재료를 추가해주세요.
            </div>
          ) : (
            <IngredientList>
              {formData.ingredients.map((ingredient, index) => (
                <IngredientItem key={ingredient.id}>
                  <IngredientInputGroup>
                    <Label>재료명</Label>
                    <Input
                      value={ingredient.name}
                      placeholder="재료명"
                      onChange={value =>
                        handleIngredientChange(index, 'name', value)
                      }
                      onEnterPress={handleAddIngredient}
                    />
                  </IngredientInputGroup>

                  <AmountInputGroup>
                    <Label>양</Label>
                    <Input
                      value={getAmountDisplayValue(ingredient)}
                      placeholder="예: 1큰술"
                      onChange={value =>
                        handleIngredientChange(index, 'amountNumber', value)
                      }
                      onEnterPress={handleAddIngredient}
                    />
                  </AmountInputGroup>

                  <RemoveIngredientButton
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    삭제
                  </RemoveIngredientButton>
                </IngredientItem>
              ))}
            </IngredientList>
          )}

          {errors.ingredients && (
            <ErrorMessage>{errors.ingredients}</ErrorMessage>
          )}
        </IngredientSection>

        {/* 사진 업로드 */}
        <FormRow>
          <Label>사진</Label>
          <PhotoPreview src={formData.photo}>
            {formData.photo && (
              <RemovePhotoButton onClick={handleRemovePhoto}>
                ×
              </RemovePhotoButton>
            )}
          </PhotoPreview>
          <Input
            type="file"
            accept="image/*"
            onFileChange={handlePhotoChange}
            error={errors.photo}
          />
        </FormRow>

        {/* 에러 메시지 */}
        {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}

        {/* 버튼 그룹 */}
        <ButtonRow>
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : editRecipe ? '수정' : '저장'}
          </Button>
        </ButtonRow>
      </FormContainer>
    </Modal>
  );
};

export default AddRecipeModal;
