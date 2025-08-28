import styled, { css } from 'styled-components';

export const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;

  &.required::after {
    content: '*';
    color: #dc3545;
    margin-left: 0.25rem;
  }
`;

const baseInputStyles = css`
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 1rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #6c757d;
  }
`;

export const StyledInput = styled.input<{ hasError?: boolean }>`
  ${baseInputStyles}

  ${({ hasError }) =>
    hasError &&
    css`
      border-color: #dc3545;

      &:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
      }
    `}
`;

export const StyledTextarea = styled.textarea<{ hasError?: boolean }>`
  ${baseInputStyles}
  resize: vertical;
  min-height: 100px;

  ${({ hasError }) =>
    hasError &&
    css`
      border-color: #dc3545;

      &:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
      }
    `}
`;

export const FileInputContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

export const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: #e9ecef;
  }
`;

export const HiddenFileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

export const ErrorMessage = styled.div`
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
`;
