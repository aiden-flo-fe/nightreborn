import styled from 'styled-components';

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

export const ButtonGroup = styled.div`
  position: absolute;
  top: 15px;
  left: 160px;
  display: flex;
  gap: 0.5rem;
`;

export const AddSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.6rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

export const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
`;

export const CategoryItem = styled.div<{ isDragging?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;

  ${({ isDragging }) =>
    isDragging &&
    `
    opacity: 0.5;
    transform: rotate(2deg);
  `}

  &:hover {
    background-color: #f8f9fa;
  }
`;

export const CategoryName = styled.span`
  font-weight: 500;
  color: #333;
  flex: 1;
`;

export const CategoryActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const DragHandle = styled.div`
  cursor: grab;
  color: #6c757d;
  font-size: 1.25rem;
  margin-right: 0.5rem;

  &:active {
    cursor: grabbing;
  }
`;

export const EditForm = styled.div`
  display: flex;
  gap: 0.5rem;
  flex: 1;
  margin-right: 0.5rem;
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
`;
