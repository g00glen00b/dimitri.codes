import styled from '@emotion/styled';

export const PrimaryNav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 700px) {
    flex-direction: column;
  }
`;
