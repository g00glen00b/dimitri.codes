import React from 'react';
import './PostCard.css';
import PropTypes from 'prop-types';
import {Link} from 'gatsby';
import {IoIosArrowRoundForward} from 'react-icons/io';
import Img from 'gatsby-image';

export const PostCard = ({featuredImage, categories: [firstCategory] = [], excerpt, date, slug, title}) => {
  return (
    <Link
      className="excerpt"
      to={`/${slug}`}
      title="View post">
      <div className="excerpt--header">
        {featuredImage && <div className="excerpt--header__image">
          <Img fluid={featuredImage.childImageSharp.fluid}/>
        </div>}
        <span className="excerpt--header__category">
          {firstCategory}
        </span>
        <h2>
          {title}
        </h2>
        <time className="excerpt--header__date">
          {date}
        </time>
      </div>
      <div className="excerpt--body">
        <p>
          {excerpt}
        </p>
        <span
          className="excerpt--read-more">
          Read more <IoIosArrowRoundForward/>
        </span>
      </div>
    </Link>
  );
};

PostCard.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string),
  slug: PropTypes.string,
  title: PropTypes.string,
  excerpt: PropTypes.string,
  date: PropTypes.string,
  featuredImage: PropTypes.shape({
    childImageSharp: PropTypes.shape({
      fluid: PropTypes.object
    })
  })
};

//
// <span className="excerpt__category">
//         {firstCategory}
//       </span>
// <h2 className="excerpt__title">
//   {isNew && <span className="excerpt__title--new">New</span>}
//   <Link to={`/${slug}`}>
//     {title}
//   </Link>
// </h2>
// <div className="excerpt__time">
//         <span className="excerpt__time--estimation">
//           {readingTime} min read
//         </span>
// </div>
// {!tagless && <div className="excerpt__tags">
//   <Tags tags={tags}/>
// </div>}
// <div className="excerpt__content">
//   <p>
//     {manualExcerpt != null ? manualExcerpt : excerpt}
//   </p>
// </div>
// <div className="excerpt__more">
//   <Link to={`/${slug}`}>Read more</Link>
// </div>
