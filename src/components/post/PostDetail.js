import React from 'react';
import parse, {domToReact} from 'html-react-parser';
import {PostImage} from './PostImage';
import {PostCode} from './PostCode';
import {PageTitle} from '../page/PageTitle';
import {PostMeta} from './PostMeta';

const wordpressClasses = [
  'wp-block-code',
  'prettyprint',
  'linenums',
  'inline:true',
  'decode:1',
  'pre-scrollable',
  'lang:default'
];

const getImage = node => {
  if (node.name === 'img') {
    return node;
  } else if (node.children != null) {
    for (let index = 0; index < node.children.length; index++) {
      let image = getImage(node.children[index]);
      if (image != null) return image;
    }
  }
};

const isImage = node => node.name === 'p'
  || (node.attribs != null && node.attribs.class != null && node.attribs.class.includes('wp-block-image'));

const replaceMedia = node => {
  if (isImage(node)) {
    const image = getImage(node);
    if (image != null) {
      return <PostImage src={image.attribs.src} alt={image.attribs.alt} width={image.attribs.width}/>;
    }
  } else if (node.name === 'pre') {
    return node.children.length > 0 && <PostCode language={getLanguage(node)}>{domToReact(getCode(node))}</PostCode>;
  }
};

const getLanguage = node => {
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

export const PostDetail = ({title, readingTime, content, tags, date}) => {
  return (
    <article>
      <header>
        <PageTitle>{title}</PageTitle>
        <PostMeta
          readingTime={readingTime}
          tags={tags}
          date={date}/>
      </header>
      <div>{parse(content, {replace: replaceMedia})}</div>
    </article>
  );
};
