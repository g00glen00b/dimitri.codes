import React from 'react';
import styled from '@emotion/styled';
import {SimpleLink} from './SimpleLink';

const PaginationNav = styled.nav`
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  opacity: 0.8;
  color: ${({theme}) => theme.textColor};
`;

export const Pagination = ({currentPage, pageCount, base}) => (
  <PaginationNav>
    {currentPage > 1 ? (
      <SimpleLink
        title="Go to previous page"
        to={`${base}/page/${currentPage - 1}`}>
        &larr; Newer posts
      </SimpleLink>) :
      <span />}
    Page {currentPage} of {pageCount}
    {currentPage < pageCount ? (
      <SimpleLink
        title="Go to next page"
        to={`${base}/page/${currentPage + 1}`}>
        Older posts &rarr;
      </SimpleLink>) :
      <span />}
  </PaginationNav>
);
