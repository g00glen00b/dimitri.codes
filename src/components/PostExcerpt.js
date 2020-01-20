import React from 'react';
import './PostExcerpt.css';
import {Tags} from './Tags';
import {Link} from 'gatsby';

export const PostExcerpt = ({categories: [firstCategory] = [], excerpt, isNew, readingTime, slug, tags, title}) => {
  return (
    <article className="excerpt">
      <span className="excerpt__category">
        {firstCategory && firstCategory.name}
      </span>
      <h2 className="excerpt__title">
        {isNew && <span className="excerpt__title--new">New!</span>}
        {title}
      </h2>
      <div className="excerpt__time">
        <span className="excerpt__time--estimation">
          {readingTime != null && readingTime.text}
        </span>
      </div>
      <div className="excerpt__tags">
        <Tags tags={tags}/>
      </div>
      <div className="excerpt__content" dangerouslySetInnerHTML={{__html: excerpt}}/>
      <div className="excerpt__more">
        <Link to={`/${slug}`}>Read more</Link>
      </div>
    </article>
  );
}
