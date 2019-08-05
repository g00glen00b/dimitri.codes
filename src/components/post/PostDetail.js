import React from 'react';
import {PostTags} from './PostTags';
import {PageTitle, PostMeta, PostTitleLink} from '../../theme';

export const PostDetail = ({title, slug, readingTime: {text}, content, tags, date}) => (
  <article>
    <header>
      <PageTitle><PostTitleLink to={`/${slug}`} dangerouslySetInnerHTML={{__html: title}}/></PageTitle>
      <PostMeta>{date} | {text} | <PostTags tags={tags}/></PostMeta>
    </header>
    <p dangerouslySetInnerHTML={{__html: content}}/>
  </article>
);
