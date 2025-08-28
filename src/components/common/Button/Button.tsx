import React from 'react';

import { StyledButton } from '~/components/common/Button/Button.styled';
import type { ButtonProps } from '~/components/common/Button/Button.types';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  children,
  type = 'button',
  fullWidth = false,
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      type={type}
      fullWidth={fullWidth}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
