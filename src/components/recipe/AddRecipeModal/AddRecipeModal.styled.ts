import styled from 'styled-components';

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const HorizontalFormRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;

  > * {
    flex: 1;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PhotoPreview = styled.div<{ src?: string }>`
  width: 200px;
  height: 150px;
  border: 2px dashed #ced4da;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  background-image: ${({ src }) => (src ? `url(${src})` : 'none')};
  background-size: cover;
  background-position: center;
  color: #6c757d;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  position: relative;

  ${({ src }) =>
    !src &&
    `
    &::before {
      content: '사진을 선택하세요\\A(선택사항)';
      white-space: pre;
    }
  `}
`;

export const RemovePhotoButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(220, 53, 69, 1);
  }
`;

export const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
`;

export const CategorySelect = styled.select`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 1rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

export const IngredientSection = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f8f9fa;
`;

export const IngredientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const IngredientTitle = styled.h4`
  margin: 0;
  font-size: 1.125rem;
  color: #333;
`;

export const IngredientList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0.75rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
`;

export const IngredientItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: white;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;

  > div:first-child {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  input {
    font-size: 0.875rem;

    &::placeholder {
      color: #ccc;
    }
  }
`;

export const IngredientInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 50%;
`;

export const AmountInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 30%;
`;

export const RemoveIngredientButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;
  margin-top: auto;
  height: 42px;
  width: 15%;

  &:hover {
    background: #c82333;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  margin-top: 1rem;
`;

export const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;
