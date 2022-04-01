import React from 'react';
import {GatsbyImage} from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import {TiCalendarOutline, TiStopwatch, TiTag} from 'react-icons/ti';
import {Link} from 'gatsby';
import './PageTitle.css';

export const PageTitle = ({featuredImage, title, date, timeToRead, tags}) => (
  <div className={`page-title ${featuredImage != null ? `page-title--with-image` : `page-title--without-image`}`}>
    {featuredImage && <div className="page-title__image">
      <GatsbyImage
        image={featuredImage.childImageSharp.gatsbyImageData}
        alt={`Featured image for "${title}"`}/>
    </div>}
    <h1 className="page-title__title">{title}</h1>
    <dl className="page-title__info">
      <dt>
        <TiCalendarOutline
          size={24}
          aria-label="Calendar icon"/>
      </dt>
      <dd
        aria-label={`Posted at ${date}`}>
        {date}
      </dd>

      <dt>
        <TiStopwatch
          size={24}
          aria-label="Stopwatch icon"/>
      </dt>
      <dd>
        {timeToRead} minute read
      </dd>

      {tags != null && <dt>
        <TiTag
          size={24}
          aria-label="Tag icon"/>
      </dt>}
      {tags != null && <dd>
        {tags.map(({name, path}) => <Link
          to={`/tag/${path}`}
          title={`View all posts tagged with ${name}`}
          key={path}>
          {name}
        </Link>)}
        </dd>}
    </dl>
  </div>
);

PageTitle.propTypes = {
  timeToRead: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string,
    name: PropTypes.string
  })),
  date: PropTypes.string,
  title: PropTypes.string,
  featuredImage: PropTypes.shape({
    childImageSharp: PropTypes.shape({
      gatsbyImageData: PropTypes.object
    })
  })
};
