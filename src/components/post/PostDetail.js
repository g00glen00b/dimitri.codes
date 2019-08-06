import React from 'react';
import {PostTags} from './PostTags';
import {PageTitle, PostMeta} from '../../theme';

export const PostDetail = ({title, readingTime: {text}, content, tags, date}) => (
  <article>
    <header>
      <PageTitle>{title}</PageTitle>
      <PostMeta>{date} | {text} | <PostTags tags={tags}/></PostMeta>
    </header>
    <div dangerouslySetInnerHTML={{__html: content}}/>
  </article>
);
