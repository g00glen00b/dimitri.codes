import React from 'react';
import {PostTags} from './PostTags';
import {PageTitle, PostMeta} from '../../theme';
import parse from 'html-react-parser';
import {PostImage} from './PostImage';

const replaceImages = node => {
  if (node.name === 'img') {
    return <PostImage src={node.attribs.src} alt={node.attribs.alt}/>;
  }
};

export const PostDetail = ({title, readingTime: {text}, content, tags, date}) => (
  <article>
    <header>
      <PageTitle>{title}</PageTitle>
      <PostMeta>{date} | {text} | <PostTags tags={tags}/></PostMeta>
    </header>
    <div>{parse(content, {replace: replaceImages})}</div>
  </article>
);
