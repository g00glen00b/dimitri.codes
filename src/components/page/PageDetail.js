import React from 'react';
import {PageTitle, PostTitleLink} from '../../theme';


export const PageDetail = ({title, slug, content}) => (
  <article>
    <header>
      <PageTitle><PostTitleLink to={`/${slug}`} dangerouslySetInnerHTML={{__html: title}}/></PageTitle>
    </header>
    <p dangerouslySetInnerHTML={{__html: content}}/>
  </article>
);
