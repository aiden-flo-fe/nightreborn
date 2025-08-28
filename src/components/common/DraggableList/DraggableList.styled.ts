import styled from 'styled-components';

export const DragContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const DragItem = styled.div<{ isDragging?: boolean; isOver?: boolean }>`
  transition: all 0.2s ease-in-out;

  ${({ isDragging }) =>
    isDragging &&
    `
    opacity: 0.5;
    transform: rotate(2deg);
    z-index: 1000;
  `}

  ${({ isOver }) =>
    isOver &&
    `
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `}
`;

export const DropIndicator = styled.div<{ isActive: boolean }>`
  height: 2px;
  background-color: ${({ isActive }) => (isActive ? '#007bff' : 'transparent')};
  border-radius: 1px;
  transition: all 0.2s ease-in-out;
  margin: ${({ isActive }) => (isActive ? '0.25rem 0' : '0')};
`;
