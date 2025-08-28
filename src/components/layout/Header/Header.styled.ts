import styled from 'styled-components';

export const HeaderContainer = styled.header`
  background-color: #fff;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

export const Logo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;
