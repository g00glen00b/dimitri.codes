import styled from '@emotion/styled';
import {Link} from 'gatsby';
import React from 'react';

export const maxWidth = '800px';
export const textColor = '#222222';
export const iconColor = '#444444';
export const primaryColor = '#55BABF';
export const primaryColorLight = '#E6FEFF';
export const primaryColorDark = '#458083';
export const secondaryColor = '#D34A3A';
export const textFont = 'Roboto, sans-serif';
export const codeFont = 'Roboto Mono, monospace';

export const SiteDivider = styled.hr`
  width: 100px;
  border: none;
  border-bottom: solid 2px ${textColor};
  margin: 30px auto;
`;

export const PostTitleLink = styled(props => <Link {...props}/>)`
  font-weight: 400;
`;

export const PostMeta = styled.small`
  opacity: 0.8;
`;

export const NavItemLink = styled(props => <Link {...props}/>)`
  text-decoration: none;
  margin: 0 1em;
  font-weight: 500;
`;

export const NavTitleLink = styled(props => <Link {...props}/>)`
  text-decoration: none;
  margin: 0 1em;
`;

export const PrimaryNav = styled.nav`
  display: flex;
  align-items: center;
`;

export const Spacer = styled.div`
  flex-grow: 1;
`;

export const Message = styled.p`
  background-color: ${primaryColorLight};
  color: ${primaryColorDark};
  padding: 2em 4em;
  
  @media (max-width: 800px) {
    padding: 2em;
  }
`;

export const SimpleLink = styled(props => <Link {...props}/>)`
  text-decoration: none;
`;

export const LinkButton = styled(props => <Link {...props}/>)`
  text-decoration: none;
  background-color: ${primaryColor};
  color: white;
  padding: 0.8em;
  border-radius: 3px;
  transition: background .3s;
  text-align: center;
  
  &:hover {
    background-color: ${primaryColorDark};
  }
  
  &:active {
    background-color: ${primaryColorDark};
  }
`;


export const PageTitle = styled.h1`
  margin-bottom: 0.2em;
  font-size: 40px;
`;
