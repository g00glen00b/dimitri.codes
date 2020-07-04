import React from 'react';
import Img from 'gatsby-image';
import PropTypes from 'prop-types';
import {TiCalendarOutline, TiStopwatch, TiTag} from 'react-icons/ti';
import {Link} from 'gatsby';
import './PageTitle.css';
import {kebabCase} from '../helpers/contentHelpers';

export const PageTitle = ({featuredImage, title, date, timeToRead, tags}) => (
  <div className={`page-title ${featuredImage != null ? `page-title--with-image` : `page-title--without-image`}`}>
    {featuredImage && <div className="page-title__image">
      <Img fluid={featuredImage.childImageSharp.fluid}/>
    </div>}
    <h1 className="page-title__title">{title}</h1>
    <dl className="page-title__info">
      <dt>
        <TiCalendarOutline
          size={24}
          aria-label="Calendar icon"
          title="Posted at"/>
      </dt>
      <dd>{date}</dd>

      <dt>
        <TiStopwatch
          size={24}
          aria-label="Stopwatch icon"
          title="Time to read"/>
      </dt>
      <dd>{timeToRead} minute read</dd>

      {tags != null && <dt>
        <TiTag
          size={24}
          aria-label="Tag icon"
          title="Tags"/>
      </dt>}
      {tags != null && <dd>
        {tags.map(tag => <Link
          to={`/tag/${kebabCase(tag)}`}
          title={`View all posts tagged with ${tag}`}
          key={tag}>
          {tag}
        </Link>)}
        </dd>}
    </dl>
  </div>
);

PageTitle.propTypes = {
  timeToRead: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
  date: PropTypes.string,
  title: PropTypes.string,
  featuredImage: PropTypes.shape({
    childImageSharp: PropTypes.shape({
      fluid: PropTypes.object
    })
  })
};
