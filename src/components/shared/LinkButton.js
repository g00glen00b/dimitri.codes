import styled from '@emotion/styled';
import {Link} from 'gatsby';
import React from 'react';

export const LinkButton = styled(props => <Link {...props}/>)`
  text-decoration: none;
  background-color: ${({theme}) => theme.primaryColor};
  color: white;
  padding: 0.8em;
  border-radius: 3px;
  transition: background .3s;
  text-align: center;
  
  &:hover {
    background-color: ${({theme}) => theme.primaryColorDark};
  }
  
  &:active {
    background-color: ${({theme}) => theme.primaryColorDark};
  }
`;
