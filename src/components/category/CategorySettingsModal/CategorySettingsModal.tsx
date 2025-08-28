import React, { useState } from 'react';
import { Modal, Button, Input, DraggableList } from '~/components/common';
import {
  ModalHeader,
  ButtonGroup,
  AddSection,
  CategoryList,
  CategoryItem,
  CategoryName,
  CategoryActions,
  EditForm,
  EmptyMessage,
} from '~/components/category/CategorySettingsModal/CategorySettingsModal.styled';
import type { CategorySettingsModalProps } from '~/components/category/CategorySettingsModal/CategorySettingsModal.types';
import type { Category } from '~/types';
import { generateId, confirm } from '~/utils';
import {
  saveCategory,
  deleteCategory,
  saveCategories,
} from '~/utils/localStorage';

const CategorySettingsModal: React.FC<CategorySettingsModalProps> = ({
  onClose,
  categories,
  onSuccess,
  isOpen = false,
  sortMode: initialSortMode = false,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [sortMode, setSortMode] = useState(initialSortMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 새 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    try {
      const maxOrder =
        categories.length > 0 ? Math.max(...categories.map(c => c.order)) : 0;

      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
        order: maxOrder + 1,
      };

      saveCategory(newCategory);
      setNewCategoryName('');
      onSuccess();
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 카테고리 수정 시작
  const handleEditStart = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  // 카테고리 수정 완료
  const handleEditSave = async (categoryId: string) => {
    if (!editingName.trim()) return;

    setIsSubmitting(true);
    try {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        const updatedCategory = {
          ...category,
          name: editingName.trim(),
        };
        saveCategory(updatedCategory);
        setEditingId(null);
        setEditingName('');
        onSuccess();
      }
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 카테고리 수정 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (
      confirm(
        `"${category.name}" 카테고리를 삭제하시겠습니까?\\n이 카테고리의 레시피들은 "기타" 분류로 이동됩니다.`
      )
    ) {
      setIsSubmitting(true);
      try {
        deleteCategory(categoryId);
        onSuccess();
      } catch (error) {
        console.error('카테고리 삭제 실패:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 정렬 모드 전환
  const handleToggleSortMode = () => {
    setSortMode(!sortMode);
    if (editingId) {
      handleEditCancel();
    }
  };

  // 드래그앤드롭으로 카테고리 순서 변경
  const handleCategoryReorder = async (newCategories: Category[]) => {
    try {
      saveCategories(newCategories);
      onSuccess();
    } catch (error) {
      console.error('카테고리 순서 저장 실패:', error);
    }
  };

  // 정렬 완료
  const handleSortComplete = () => {
    setSortMode(false);
  };

  // 정렬 취소
  const handleSortCancel = () => {
    setSortMode(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="카테고리 설정" size="large">
      <ModalHeader>
        <ButtonGroup>
          {!sortMode ? (
            <Button
              variant="secondary"
              size="medium"
              onClick={handleToggleSortMode}
              disabled={categories.length === 0}
            >
              노출 순서 조절
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="medium"
                onClick={handleSortComplete}
              >
                완료
              </Button>
              <Button
                variant="secondary"
                size="medium"
                onClick={handleSortCancel}
              >
                취소
              </Button>
            </>
          )}
        </ButtonGroup>
      </ModalHeader>

      {/* 카테고리 추가 섹션 */}
      {!sortMode && (
        <AddSection>
          <Input
            value={newCategoryName}
            placeholder="새 카테고리 이름"
            onChange={value => setNewCategoryName(String(value))}
            onEnterPress={handleAddCategory}
            fullWidth
          />
          <Button
            variant="primary"
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim() || isSubmitting}
          >
            추가하기
          </Button>
        </AddSection>
      )}

      {/* 카테고리 목록 */}
      {categories.length === 0 ? (
        <EmptyMessage>아직 카테고리가 없습니다.</EmptyMessage>
      ) : sortMode ? (
        // 정렬 모드 - 드래그앤드롭 리스트
        <DraggableList
          items={categories}
          onReorder={handleCategoryReorder}
          renderItem={(category, _index, isDragging) => (
            <CategoryItem isDragging={isDragging}>
              <CategoryName>📋 {category.name}</CategoryName>
              <CategoryActions>
                <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                  드래그로 순서 변경
                </span>
              </CategoryActions>
            </CategoryItem>
          )}
        />
      ) : (
        // 일반 모드
        <CategoryList>
          {categories.map(category => (
            <CategoryItem key={category.id}>
              {editingId === category.id ? (
                // 수정 모드
                <>
                  <EditForm>
                    <Input
                      value={editingName}
                      onChange={value => setEditingName(String(value))}
                      onEnterPress={() => handleEditSave(category.id)}
                      fullWidth
                    />
                  </EditForm>
                  <CategoryActions>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleEditSave(category.id)}
                      disabled={!editingName.trim() || isSubmitting}
                    >
                      저장
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleEditCancel}
                    >
                      취소
                    </Button>
                  </CategoryActions>
                </>
              ) : (
                // 일반 모드
                <>
                  <CategoryName>{category.name}</CategoryName>
                  <CategoryActions>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleEditStart(category)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={isSubmitting}
                    >
                      삭제
                    </Button>
                  </CategoryActions>
                </>
              )}
            </CategoryItem>
          ))}
        </CategoryList>
      )}
    </Modal>
  );
};

export default CategorySettingsModal;
