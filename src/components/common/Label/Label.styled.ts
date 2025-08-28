import styled from 'styled-components';

export const StyledLabel = styled.label<{ required?: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;

  ${({ required }) =>
    required &&
    `
    &::after {
      content: '*';
      color: #dc3545;
      margin-left: 0.25rem;
    }
  `}
`;
