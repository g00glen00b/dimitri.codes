import React from 'react';
import styled from '@emotion/styled';
import {PostTitleLink} from './PostTitleLink';
import {PostMeta} from './PostMeta';

const PostTitle = styled.h2`
  margin-bottom: 0.2em;
  font-weight: 500;
  font-size: 1.8em;
`;

const PostArticle = styled.article`
  margin-bottom: 2em;
`;

const PostExcerpt = styled.div`
  opacity: 0.7;
`;

export const PostItem = ({title, slug, readingTime, excerpt, tags, date}) => (
  <PostArticle>
    <header>
      <PostTitle>
        <PostTitleLink to={`/${slug}`}>{title}</PostTitleLink>
      </PostTitle>
      <PostMeta
        readingTime={readingTime}
        tags={tags}
        date={date}/>
    </header>
    <PostExcerpt
      dangerouslySetInnerHTML={{__html: excerpt}}/>
  </PostArticle>
);
