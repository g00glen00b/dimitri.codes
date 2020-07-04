import React from 'react';
import Logo from '../../content/images/logo.svg';
import {graphql, Link, useStaticQuery} from 'gatsby';
import './Header.css';

const headerLinksQuery = graphql`
  query {
    site {
      siteMetadata {
        headerLinks {
          name
          to
        }
      }
    }
  }
`;

export const Header = () => {
  const {site: {siteMetadata: {headerLinks = []} = {}} = {}} = useStaticQuery(headerLinksQuery);
  return (
    <header className="header">
      <Link to="/" className="header__logo" title="Home">
        <Logo/>
      </Link>
      <nav className="header__navigation">
        {headerLinks.map(({name, to}) => (
          <Link key={name} to={to}>{name}</Link>
        ))}
      </nav>
    </header>
  );
};
