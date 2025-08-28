import styled from 'styled-components';

export const CardContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const RecipeImage = styled.div<{ src?: string }>`
  width: 100%;
  height: 150px;
  border-radius: 6px;
  background-color: #f8f9fa;
  background-image: ${({ src }) => (src ? `url(${src})` : 'none')};
  background-size: cover;
  background-position: center;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 2rem;

  ${({ src }) =>
    !src &&
    `
    &::before {
      content: '🍽️';
    }
  `}
`;

export const RecipeTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
`;

export const CategoryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  min-height: 24px;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #e9ecef;
  color: #495057;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

export const EditButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 1;
  transform: scale(0.9);

  ${CardContainer}:hover & {
    opacity: 1;
    transform: scale(1);
  }

  &:hover {
    background-color: #007bff;
    color: white;
  }

  &:focus {
    outline: none;
    background-color: #007bff;
    color: white;
    opacity: 1;
    transform: scale(1);
  }
`;

export const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 1;
  transform: scale(0.9);

  ${CardContainer}:hover & {
    opacity: 1;
    transform: scale(1);
  }

  &:hover {
    background-color: #dc3545;
    color: white;
  }

  &:focus {
    outline: none;
    background-color: #dc3545;
    color: white;
    opacity: 1;
    transform: scale(1);
  }
`;

export const IngredientCount = styled.div`
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;
