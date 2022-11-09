import React from 'react';
import Logo from '../../content/images/logo-square.svg';
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
    <header
      className="header"
      aria-label="Primary navigation">
      <Link to="/" className="header-logo" title="Home">
        <Logo aria-label="Website logo"/>
      </Link>
      <nav className="header-navigation">
        {headerLinks.map(({name, to}) => (
          <Link key={name} to={to}>{name}</Link>
        ))}
      </nav>
    </header>
  );
};
