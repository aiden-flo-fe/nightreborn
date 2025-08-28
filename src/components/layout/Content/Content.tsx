import React from 'react';
import { ContentContainer, ContentInner } from './Content.styled';
import type { ContentProps } from './Content.types';

const Content: React.FC<ContentProps> = ({ children }) => {
  return (
    <ContentContainer>
      <ContentInner>{children}</ContentInner>
    </ContentContainer>
  );
};

export default Content;
