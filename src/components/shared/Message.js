import styled from '@emotion/styled';
import {primaryColorDark, primaryColorLight} from './theme';

export const Message = styled.p`
  background-color: ${primaryColorLight};
  color: ${primaryColorDark};
  padding: 2em 4em;
  
  @media (max-width: 800px) {
    padding: 2em;
  }
`;
