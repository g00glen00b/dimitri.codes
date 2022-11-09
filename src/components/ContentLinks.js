import {Link} from 'gatsby';
import React from 'react';
import PropTypes from 'prop-types';
import './ContentLinks.css';

export const ContentLinks = ({links}) => (
  <nav className="content-links">
    {links.map(({name, to, outbound}) => outbound ? (
        <a
          href={to}
          key={name}
          target="_blank"
          rel="noopener noreferrer">
          {name}
        </a>
      ) : (
        <Link
          to={to}
          key={name}>
          {name}
        </Link>
      )
    )}
  </nav>
);

ContentLinks.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({
    outbound: PropTypes.bool,
    to: PropTypes.string,
    name: PropTypes.string
  }))
};
