import React from 'react';
import {Link} from 'gatsby';
import './Tags.css';
import {kebabCase} from '../helpers/contentHelpers';
import PropTypes from 'prop-types';

export const Tags = ({tags}) => (
  <ul className="tags">
    {tags != null && tags.map(name => (
      <li key={name}>
        <Link to={`/tag/${kebabCase(name)}`}>
          {name}
        </Link>
      </li>
    ))}
  </ul>
);

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string)
};
