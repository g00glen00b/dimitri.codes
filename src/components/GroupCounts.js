import React from 'react';
import {Link} from 'gatsby';
import './Tags.css';
import {kebabCase} from '../helpers/contentHelpers';
import PropTypes from 'prop-types';

export const GroupCounts = ({groups, base = `/tag`}) => (
  <ul className="tags">
    {groups != null && groups.map(({fieldValue, totalCount}) => (
      <li key={fieldValue}>
        <Link to={`${base}/${kebabCase(fieldValue)}`}>
          {fieldValue}
          {` `}
          <strong>
            {totalCount}
          </strong>
        </Link>
      </li>
    ))}
  </ul>
);

GroupCounts.propTypes = {
  base: PropTypes.string,
  groups: PropTypes.arrayOf(PropTypes.shape({
    fieldValue: PropTypes.string.isRequired,
    totalCount: PropTypes.number.isRequired
  }))
};
