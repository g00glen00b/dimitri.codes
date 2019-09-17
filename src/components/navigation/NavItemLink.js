import styled from '@emotion/styled';
import React from 'react';
import {SimpleLink} from '../shared/SimpleLink';

export const NavItemLink = styled(props => <SimpleLink {...props}/>)`
  text-decoration: none;
  margin: 0 1em;
  font-weight: 500;
  
  &:last-of-type {
    margin-right: 0;
  }
  
  @media (max-width: 800px) {
    margin: 0 .5em;
  }
`;

