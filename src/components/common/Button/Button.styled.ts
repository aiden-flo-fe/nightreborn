import styled, { css } from 'styled-components';
import type { ButtonProps } from './Button.types';

const variantStyles = {
  primary: css`
    background-color: #007bff;
    color: white;
    border: 1px solid #007bff;

    &:hover:not(:disabled) {
      background-color: #0056b3;
      border-color: #0056b3;
    }
  `,
  secondary: css`
    background-color: #6c757d;
    color: white;
    border: 1px solid #6c757d;

    &:hover:not(:disabled) {
      background-color: #545b62;
      border-color: #545b62;
    }
  `,
  danger: css`
    background-color: #dc3545;
    color: white;
    border: 1px solid #dc3545;

    &:hover:not(:disabled) {
      background-color: #c82333;
      border-color: #c82333;
    }
  `,
};

const sizeStyles = {
  small: css`
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.2rem;
  `,
  medium: css`
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 0.25rem;
  `,
  large: css`
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
    border-radius: 0.3rem;
  `,
};

export const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease-in-out;
  white-space: nowrap;

  ${({ variant = 'primary' }) => variantStyles[variant]}
  ${({ size = 'medium' }) => sizeStyles[size]}
  
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;
