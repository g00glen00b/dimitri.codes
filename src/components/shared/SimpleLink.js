import styled from '@emotion/styled';
import {Link} from 'gatsby';
import React from 'react';

export const SimpleLink = styled(props => <Link {...props}/>)`
  text-decoration: none;
  color: ${({theme}) => theme.textColor};
`;
