import styled from 'styled-components';

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const CategorySection = styled.div`
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 2rem;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

export const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const CategoryTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const RecipeCount = styled.span`
  font-size: 1rem;
  font-weight: normal;
  color: #6c757d;
  margin-left: 0.5rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.125rem;
`;

export const NoRecipesMessage = styled.div`
  color: #6c757d;
  font-style: italic;
  padding: 1rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

export const SortModeInfo = styled.div`
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #0d47a1;

  &::before {
    content: '🔄';
    font-size: 1rem;
  }
`;
