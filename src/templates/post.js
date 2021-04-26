import React from 'react';
import {graphql} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {getSectionMetadata, getTagMetadata, getTimeMetadata} from '../helpers/metadataHelpers';
import PropTypes from 'prop-types';
import {PageTitle} from '../components/PageTitle';

const Post = ({data: {markdownRemark}}) => {
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
        {!isPage && <PageTitle
          title={markdownRemark.frontmatter.title}
          timeToRead={!isPage && markdownRemark.timeToRead}
          date={markdownRemark.frontmatter.date}
          featuredImage={markdownRemark.frontmatter.featuredImage}
          tags={markdownRemark.frontmatter.tags}/>
        }
        {isPage && <h1>{markdownRemark.frontmatter.title}</h1>}
        <div dangerouslySetInnerHTML={{__html: markdownRemark.html}}/>
      </Layout>
    );
}

export const query = graphql`
  query ($id: String!) {
      markdownRemark(id: {eq: $id}) {
        frontmatter {
          title
          tags
          categories
          featuredImage {
            childImageSharp {
              gatsbyImageData(layout: CONSTRAINED, width: 80)
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
        featuredImage: PropTypes.shape({
          childImageSharp: PropTypes.shape({
            gatsbyImageData: PropTypes.object
          })
        }),
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
  })
};
