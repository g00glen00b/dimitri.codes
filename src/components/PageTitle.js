import React from 'react';
import Img from 'gatsby-image';
import {Tags} from './Tags';
import PropTypes from 'prop-types';
import './PageTitle.css';

export const PageTitle = ({featuredImage, title, date, timeToRead, tags}) => (
  <div className={`page-title ${featuredImage != null ? `page-title--with-image` : `page-title--without-image`}`}>
    {featuredImage && <div className="page-title__image">
      <Img fluid={featuredImage.childImageSharp.fluid}/>
    </div>}
    <h1 className="page-title__title">{title}</h1>
    <p className="page-title__metadata">
      {date}, {timeToRead} min read
    </p>
    <Tags tags={tags}/>
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
