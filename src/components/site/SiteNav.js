import {SiteLogo} from './SiteLogo';
import React from 'react';
import {Link} from 'gatsby';
import {NavItemLink, NavTitleLink, PrimaryNav, SiteIdentity} from '../../theme';

export const SiteNav = ({title}) => (
  <PrimaryNav>
    <SiteIdentity>
        <SiteLogo/>
        <NavTitleLink to="/">{title}</NavTitleLink>
    </SiteIdentity>
    <div>
        <Link to={"/"}/>
        <NavItemLink to="/">Home</NavItemLink>
        <NavItemLink to="/category/t">Tutorials</NavItemLink>
        <NavItemLink to="/speaking">Speaking</NavItemLink>
        <NavItemLink to="/about-me">About</NavItemLink>
    </div>
  </PrimaryNav>
);
