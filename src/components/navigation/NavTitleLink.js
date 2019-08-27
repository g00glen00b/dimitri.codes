import styled from '@emotion/styled';
import {Link} from 'gatsby';
import React from 'react';

export const NavTitleLink = styled(props => <Link {...props}/>)`
  text-decoration: none;
  margin: 0 1em;
`;
