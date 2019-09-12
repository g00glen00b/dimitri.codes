import styled from '@emotion/styled';

export const SiteDivider = styled.hr`
  width: 100px;
  border: none;
  border-bottom: solid 2px ${({theme}) => theme.textColor};
  margin: 30px auto;
`;
