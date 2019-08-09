import React from 'react';
import {PostTags} from './PostTags';
import {PageTitle, PostMeta} from '../../theme';
import parse, {domToReact} from 'html-react-parser';
import {PostImage} from './PostImage';
import {PostCode} from './PostCode';

const replaceMedia = node => {
  if (node.name === 'img') {
    return <PostImage src={node.attribs.src} alt={node.attribs.alt} width={node.attribs.width}/>;
  } else if (node.name === 'pre') {
    return <PostCode language={getLanguage(node)}>{domToReact(getCode(node))}</PostCode>
  }
};

const getLanguage = node => {
  const wordpressClasses = ['wp-block-code', 'prettyprint', 'linenums', 'inline:true', 'decode:1'];
  if (node.attribs.class != null) {
    const result = node.attribs.class
      .split(' ')
      .find(className => !wordpressClasses.includes(className));
    if (result != null) {
      return result.startsWith('lang:') ? result.split(':')[1] : result;
    }
  }
  return null;
};

const getCode = node => {
  if (node.children.length > 0 && node.children[0].name === 'code') {
    return node.children[0].children;
  } else {
    return node.children;
  }
};

export const PostDetail = ({title, readingTime: {text}, content, tags, date}) => {
  return (
    <article>
      <header>
        <PageTitle>{title}</PageTitle>
        <PostMeta>{date} | {text} | <PostTags tags={tags}/></PostMeta>
      </header>
      <div>{parse(content, {replace: replaceMedia})}</div>
    </article>
  );
};
