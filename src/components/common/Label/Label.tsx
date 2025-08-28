import React from 'react';
import { StyledLabel } from './Label.styled';
import type { LabelProps } from './Label.types';

const Label: React.FC<LabelProps> = ({
  required = false,
  children,
  className,
  htmlFor,
}) => {
  return (
    <StyledLabel required={required} className={className} htmlFor={htmlFor}>
      {children}
    </StyledLabel>
  );
};

export default Label;
