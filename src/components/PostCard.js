import React from 'react';
import './PostCard.css';
import PropTypes from 'prop-types';
import {Link} from 'gatsby';
import {IoIosArrowRoundForward} from 'react-icons/io';
import {GatsbyImage} from 'gatsby-plugin-image';

export const PostCard = ({featuredImage, categories: [firstCategory] = [], excerpt, date, slug, title}) => {
  return (
    <Link
      className="excerpt"
      to={`/${slug}`}
      title="View post">
      <div className="excerpt-header">
        {featuredImage && <div className="excerpt-header-image">
          <GatsbyImage
            image={featuredImage.childImageSharp.gatsbyImageData}
            alt={`Featured image for "${title}"`}/>
        </div>}
        <span
          aria-label={`Category ${firstCategory}`}
          className="excerpt-header-category">
          {firstCategory}
        </span>
        <h2>
          {title}
        </h2>
        <time
          aria-label={`Posted at ${date}`}
          className="excerpt-header-date">
          {date}
        </time>
      </div>
      <div className="excerpt-body">
        <p>
          {excerpt}
        </p>
        <span
          aria-hidden
          className="excerpt-read-more">
          Read more <IoIosArrowRoundForward/>
        </span>
      </div>
    </Link>
  );
}

PostCard.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string),
  slug: PropTypes.string,
  title: PropTypes.string,
  excerpt: PropTypes.string,
  date: PropTypes.string,
  featuredImage: PropTypes.shape({
    childImageSharp: PropTypes.shape({
      gatsbyImageData: PropTypes.object
    })
  })
};
