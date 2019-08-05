import React from 'react';
import styled from '@emotion/styled';
import {PostTags} from './PostTags';
import {PostMeta, PostTitleLink} from '../../theme';

const PostTitle = styled.h2`
  margin-bottom: 0.2em;
  font-weight: 500;
  font-size: 1.8em;
`;

const PostArticle = styled.article`
  margin-bottom: 2em;
`;

export const PostItem = ({title, slug, readingTime: {text}, excerpt, tags, date}) => (
  <PostArticle>
    <header>
      <PostTitle><PostTitleLink to={`/${slug}`} dangerouslySetInnerHTML={{__html: title}}/></PostTitle>
      <PostMeta>{date} | {text} | <PostTags tags={tags}/></PostMeta>
    </header>
    <p dangerouslySetInnerHTML={{__html: excerpt}}/>
  </PostArticle>
);
