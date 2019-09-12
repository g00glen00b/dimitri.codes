import styled from '@emotion/styled';
import React from 'react';
import {SimpleLink} from '../shared/SimpleLink';

export const NavTitleLink = styled(props => <SimpleLink {...props}/>)`
  text-decoration: none;
  margin: 0 1em;
`;
