import React from 'react';

import { Button } from '~/components/common';
import {
  HeaderContainer,
  HeaderContent,
  Logo,
  ButtonGroup,
} from '~/components/layout/Header/Header.styled';
import type { HeaderProps } from '~/components/layout/Header/Header.types';
import { exportData } from '~/utils/localStorage';

const Header: React.FC<HeaderProps> = ({ onAddRecipe, onCategorySettings }) => {
  const handleExport = () => {
    try {
      const json = exportData();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const pad = (n: number) => String(n).padStart(2, '0');
      const now = new Date();
      const fileName = `recipe-backup-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('데이터 백업 실패:', e);
    }
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>🍳 그리고 밤은 되살아난다</Logo>
        <ButtonGroup>
          <Button variant="secondary" size="medium" onClick={handleExport}>
            데이터 백업
          </Button>
          <Button
            variant="secondary"
            size="medium"
            onClick={onCategorySettings}
          >
            카테고리 설정
          </Button>
          <Button variant="primary" size="medium" onClick={onAddRecipe}>
            레시피 추가
          </Button>
        </ButtonGroup>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
