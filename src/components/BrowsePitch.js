import React from 'react';
import {Link} from 'gatsby';
import './BrowsePitch.css';

export const BrowsePitch = () => {
  return (
    <p className="browse-pitch">
      Are you looking for a specific type of tutorial? Browse all the categories and tags <Link to="/browse">here</Link>.
    </p>
  );
}
