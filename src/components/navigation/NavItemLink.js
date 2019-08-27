import styled from '@emotion/styled';
import {Link} from 'gatsby';
import React from 'react';

export const NavItemLink = styled(props => <Link {...props}/>)`
  text-decoration: none;
  margin: 0 1em;
  font-weight: 500;
`;

