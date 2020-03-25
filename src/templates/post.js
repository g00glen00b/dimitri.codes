import React from 'react';
import {graphql} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {PostFooter} from '../components/PostFooter';
import {Tags} from '../components/Tags';
import {getSectionMetadata, getTagMetadata, getTimeMetadata} from '../helpers/metadataHelpers';
import {ElevatorPitch} from '../components/ElevatorPitch';
import PropTypes from 'prop-types';

const Post = ({data: {markdownRemark, site}}) => {
    const isPage = markdownRemark.frontmatter.categories.includes('Pages');
    return (
      <Layout>
          <SEO
            title={markdownRemark.frontmatter.title}
            description={markdownRemark.frontmatter.excerpt || markdownRemark.excerpt}
            image={markdownRemark.frontmatter.featuredImage}
            meta={[
                ...getTimeMetadata(markdownRemark.frontmatter.iso, markdownRemark.frontmatter.iso),
                ...getTagMetadata(markdownRemark.frontmatter.tags),
                ...getSectionMetadata(markdownRemark.frontmatter.categories)
            ]}/>
          <h1 className="page__title">{markdownRemark.frontmatter.title}</h1>
          {!isPage && <p className="page__metadata">
              {markdownRemark.frontmatter.date}, {markdownRemark.timeToRead} min read
          </p>}
          <Tags tags={markdownRemark.frontmatter.tags}/>
          <div dangerouslySetInnerHTML={{__html: markdownRemark.html}}/>
          <PostFooter url={`${site.siteMetadata.siteUrl}/${markdownRemark.fields.slug}`}/>
          <ElevatorPitch/>
      </Layout>
    );
}

export const query = graphql`
  query ($id: String!) {
      site {
        siteMetadata {
          siteUrl
        }
      }
      markdownRemark(id: {eq: $id}) {
        frontmatter {
          title
          tags
          categories
          featuredImage {
            childImageSharp {
              fluid(maxWidth: 512) {
                src
              }
            }
          }
          iso: date
          date(formatString: "MMMM Do, YYYY")
          excerpt
        }
        html
        id
        timeToRead
        fields {
          slug
        }
        excerpt(format: PLAIN)
      }
    }
`;

export default Post;

Post.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      id: PropTypes.string.isRequired,
      excerpt: PropTypes.string,
      html: PropTypes.string,
      timeToRead: PropTypes.number,
      frontmatter: PropTypes.shape({
        categories: PropTypes.arrayOf(PropTypes.string),
        tags: PropTypes.arrayOf(PropTypes.string),
        daysAgo: PropTypes.number,
        iso: PropTypes.string,
        date: PropTypes.string,
        title: PropTypes.string,
        featuredImage: PropTypes.object,
        excerpt: PropTypes.string
      }),
      fields: PropTypes.shape({
        slug: PropTypes.string
      })
    }),
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        siteUrl: PropTypes.string.isRequired
      })
    })
  }),
  pageContext: PropTypes.shape({
    fieldValue: PropTypes.string.isRequired,
    base: PropTypes.string.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired
  })
};
