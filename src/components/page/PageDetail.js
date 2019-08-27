import React from 'react';
import {PageTitle} from './PageTitle';


export const PageDetail = ({title, content}) => (
  <article>
    <header>
      <PageTitle>{title}</PageTitle>
    </header>
    <div dangerouslySetInnerHTML={{__html: content}}/>
  </article>
);
