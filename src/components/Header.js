import React from 'react';
import Logo from '../images/logo.svg';
import {Link} from 'gatsby';
import './Header.css';
import {ThemeSwitch} from './ThemeSwitch';

export const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="header__logo">
        <Logo/>
      </Link>
      <nav className="header__navigation">
        <Link to="/">Home</Link>
        <Link to="/category/t">Tutorials</Link>
        <Link to="/speaking">Speaking</Link>
        <Link to="/about-me">About me</Link>
        <ThemeSwitch/>
      </nav>
    </header>
  );
};
