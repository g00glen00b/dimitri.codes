import {Link} from 'gatsby';
import React from 'react';
import './VisitBlogBanner.css';

export const VisitBlogBanner = () => (
  <section className="visit-blog">
    <Link
      className="button__primary"
      to="/category/tutorials">
      check my tutorials...
    </Link>
  </section>
);
