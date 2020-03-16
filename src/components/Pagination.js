import React from 'react';
import {Link} from 'gatsby';
import './Pagination.css';
import PropTypes from 'prop-types';

export const Pagination = ({currentPage, pageCount, base}) => (
  <nav className="pagination">
    {currentPage > 1 ? (
        <Link
          title="Go to previous page"
          to={`${base}/page/${currentPage - 1}`}>
          ← Newer posts
        </Link>) :
      <span />}
    Page {currentPage} of {pageCount}
    {currentPage < pageCount ? (
        <Link
          title="Go to next page"
          to={`${base}/page/${currentPage + 1}`}>
          Older posts →
        </Link>) :
      <span />}
  </nav>
);

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  base: PropTypes.string
};
