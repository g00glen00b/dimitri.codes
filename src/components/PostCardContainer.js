import React from 'react';
import {PostCard} from './PostCard';
import './PostCardContainer.css';
import PropTypes from 'prop-types';

export const PostCardContainer = ({posts}) => (
  <section className="posts">
    {posts.map(node => <PostCard
      key={node.id}
      categories={node.frontmatter.categories}
      excerpt={node.frontmatter.excerpt || node.excerpt}
      slug={node.fields.slug}
      date={node.frontmatter.date}
      featuredImage={node.frontmatter.featuredImage}
      title={node.frontmatter.title}/>)}
  </section>
);

PostCardContainer.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    frontmatter: PropTypes.shape({
      categories: PropTypes.arrayOf(PropTypes.string),
      title: PropTypes.string,
      manualExcerpt: PropTypes.string,
      date: PropTypes.string,
      excerpt: PropTypes.string,
      featuredImage: PropTypes.shape({
        childImageSharp: PropTypes.shape({
          gatsbyImageData: PropTypes.object
        })
      })
    }),
    fields: PropTypes.shape({
      slug: PropTypes.string,
    }),
    excerpt: PropTypes.string
  }))
};
