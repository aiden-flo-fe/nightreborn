import React from 'react';
import {
  InputContainer,
  Label,
  StyledInput,
  StyledTextarea,
  FileInputContainer,
  FileInputLabel,
  HiddenFileInput,
  ErrorMessage,
} from './Input.styled';
import type { InputProps } from './Input.types';

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  placeholder,
  disabled = false,
  onChange,
  onFileChange,
  onEnterPress,
  label,
  error,
  required = false,
  accept,
  fullWidth = false,
  rows = 4,
  multiline = false,
}) => {
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) {
      const newValue =
        type === 'number'
          ? parseFloat(event.target.value) || 0
          : event.target.value;
      onChange(newValue);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onFileChange) {
      const file = event.target.files?.[0] || null;
      onFileChange(file);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && onEnterPress) {
      event.preventDefault();
      onEnterPress();
    }
  };

  const renderInput = () => {
    if (type === 'file') {
      return (
        <FileInputContainer>
          <FileInputLabel>
            <span>📁</span>
            <span>{value ? String(value) : '파일을 선택하세요'}</span>
            <HiddenFileInput
              type="file"
              accept={accept}
              disabled={disabled}
              onChange={handleFileChange}
            />
          </FileInputLabel>
        </FileInputContainer>
      );
    }

    if (multiline) {
      return (
        <StyledTextarea
          value={String(value || '')}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          hasError={!!error}
          rows={rows}
        />
      );
    }

    return (
      <StyledInput
        type={type}
        value={String(value || '')}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        hasError={!!error}
      />
    );
  };

  return (
    <InputContainer fullWidth={fullWidth}>
      {label && <Label className={required ? 'required' : ''}>{label}</Label>}
      {renderInput()}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;
