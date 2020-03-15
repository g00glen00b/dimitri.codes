import React from 'react';
import './PostExcerpt.css';
import {Tags} from './Tags';
import {Link} from 'gatsby';

export const PostExcerpt = ({categories: [firstCategory] = [], excerpt, isNew, readingTime, slug, tags = [], title}) => {
  const tagless = tags == null || tags.length === 0;
  return (
    <article className={`excerpt ${tagless ? 'excerpt--tagless' : ''}`}>
      <span className="excerpt__category">
        {firstCategory}
      </span>
      <h2 className="excerpt__title">
        {isNew && <span className="excerpt__title--new">New</span>}
        <Link to={`/${slug}`}>
          {title}
        </Link>
      </h2>
      <div className="excerpt__time">
        <span className="excerpt__time--estimation">
          {readingTime} min read
        </span>
      </div>
      {!tagless && <div className="excerpt__tags">
        <Tags tags={tags}/>
      </div>}
      <div className="excerpt__content">
        <p>
          {excerpt}
        </p>
      </div>
      <div className="excerpt__more">
        <Link to={`/${slug}`}>Read more</Link>
      </div>
    </article>
  );
}
