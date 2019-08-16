import {SiteLogo} from './SiteLogo';
import React from 'react';
import {Link} from 'gatsby';
import {NavItemLink, NavTitleLink, PrimaryNav, Spacer} from '../../theme';

export const SiteNav = ({title}) => (
  <PrimaryNav>
    <SiteLogo/>
    <NavTitleLink to="/">{title}</NavTitleLink>
    <Spacer />
    <Link to={"/"}/>
    <NavItemLink to="/">Home</NavItemLink>
    <NavItemLink to="/category/t">Tutorials</NavItemLink>
    <NavItemLink to="/speaking">Speaking</NavItemLink>
    <NavItemLink to="/about-me">About</NavItemLink>
  </PrimaryNav>
);
