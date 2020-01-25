import React from 'react';
import {Link} from 'gatsby';
import './Tags.css';

export const Tags = ({tags, base = `/tag`}) => (
  <ul className="tags">
    {tags != null && tags.map(({id, name, slug, count}) => (
      <li key={id}>
        <Link to={`${base}/${slug}`}>
          {name}
          {` `}
          {count && <strong>{count}</strong>}
        </Link>
      </li>
    ))}
  </ul>
);
