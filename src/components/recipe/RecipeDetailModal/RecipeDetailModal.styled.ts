import styled from 'styled-components';

export const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const RecipeHeader = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
`;

export const RecipeImage = styled.div<{ src?: string }>`
  width: 200px;
  height: 150px;
  border-radius: 8px;
  background-color: #f8f9fa;
  background-image: ${({ src }) => (src ? `url(${src})` : 'none')};
  background-size: cover;
  background-position: center;
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

export const RecipeInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RecipeTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

export const ServingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ServingButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

export const ServingButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ active }) => (active ? '#007bff' : '#ced4da')};
  border-radius: 0.25rem;
  background-color: ${({ active }) => (active ? '#007bff' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;

  &:hover {
    background-color: ${({ active }) => (active ? '#0056b3' : '#f8f9fa')};
    border-color: ${({ active }) => (active ? '#0056b3' : '#007bff')};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

export const DirectInputButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ active }) => (active ? '#17a2b8' : '#ced4da')};
  border-radius: 0.25rem;
  background-color: ${({ active }) => (active ? '#17a2b8' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#17a2b8')};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#138496' : '#f8f9fa')};
    border-color: ${({ active }) => (active ? '#138496' : '#17a2b8')};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.25);
  }
`;

export const ServingInput = styled.input`
  width: 100px;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: #17a2b8;
    box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.25);
  }
`;

export const ServingInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const IngredientSection = styled.div`
  margin-top: 1rem;
`;

export const IngredientTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

export const IngredientList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.75rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

export const IngredientItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  min-height: 60px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e9ecef;
  }
`;

export const IngredientName = styled.span`
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
  line-height: 1.3;
  flex: 1;
`;

export const IngredientAmount = styled.span`
  color: #007bff;
  font-weight: 600;
  font-size: 1rem;
  text-align: right;
  min-width: 80px;
  padding-left: 1rem;
`;
