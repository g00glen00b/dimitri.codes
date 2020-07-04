import React from 'react';
import {Link} from 'gatsby';
import './Pagination.css';
import PropTypes from 'prop-types';

export const Pagination = ({currentPage, pageCount, base}) => (
  <nav className="pagination">
    {currentPage > 1 ? (
        <Link
          className="button__primary"
          title="Go to previous page"
          to={`${base}/page/${currentPage - 1}`}>
          ← newer posts
        </Link>) :
      <span />}
    page {currentPage} of {pageCount}
    {currentPage < pageCount ? (
        <Link
          className="button__primary"
          title="Go to next page"
          to={`${base}/page/${currentPage + 1}`}>
          older posts →
        </Link>) :
      <span />}
  </nav>
);

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  base: PropTypes.string
};
