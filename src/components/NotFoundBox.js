import React from 'react';
import {Link} from 'gatsby';
import './NotFoundBox.css';

export const NotFoundBox = () => (
  <div className="not-found">
    <h1
      className="not-found__title">
      404
    </h1>
    <h2
      className="not-found__subtitle">
      The page you&apos;re looking for doesn&apos;t exist
    </h2>
    <Link
      to="/"
      className="not-found__link">
      Take me to the homepage &rarr;
    </Link>
  </div>
);
