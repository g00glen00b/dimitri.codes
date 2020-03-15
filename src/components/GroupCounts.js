import React from 'react';
import {Link} from 'gatsby';
import './Tags.css';
import {kebabCase} from '../helpers/contentHelpers';

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
