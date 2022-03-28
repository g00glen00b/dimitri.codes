import React from 'react';
import {graphql} from 'gatsby';
import {Seo} from '../components/Seo';
import {Layout} from '../components/Layout';
import {getSectionMetadata, getTagMetadata, getTimeMetadata} from '../helpers/metadataHelpers';
import PropTypes from 'prop-types';
import {PageTitle} from '../components/PageTitle';
import {Comments} from '../components/Comments';

const Post = ({data: {markdownRemark}}) => {
    const isPage = markdownRemark.frontmatter.categories.includes('Pages');
    const isCommentsDisabled = markdownRemark.frontmatter.disableComments || false;
    console.log(isCommentsDisabled);
    return (
      <Layout>
        <Seo
          title={markdownRemark.frontmatter.title}
          description={markdownRemark.frontmatter.excerpt || markdownRemark.excerpt}
          image={markdownRemark.socialCard}
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
        {isCommentsDisabled || <Comments/>}
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
        disableComments
      }
      html
      id
      timeToRead
      slug
      socialCard {
        publicURL
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
        disableComments: PropTypes.bool,
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
      slug: PropTypes.string,
      socialCard: PropTypes.shape({
        childImageSharp: PropTypes.shape({
          gatsbyImageData: PropTypes.object
        })
      }),
    }),
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        siteUrl: PropTypes.string.isRequired
      })
    })
  })
};
