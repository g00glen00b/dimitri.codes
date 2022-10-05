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
    return (
      <Layout>
        <Seo
          title={markdownRemark.frontmatter.title}
          description={markdownRemark.frontmatter.excerpt || markdownRemark.excerpt}
          image={markdownRemark.socialCard}
          meta={[
              ...getTimeMetadata(markdownRemark.fields.iso),
              ...getTagMetadata(markdownRemark.fields.tags),
              ...getSectionMetadata(markdownRemark.fields.categories)
          ]}/>
        {!isPage && <PageTitle
          title={markdownRemark.frontmatter.title}
          timeToRead={!isPage && markdownRemark.timeToRead}
          date={markdownRemark.fields.postDate}
          featuredImage={markdownRemark.frontmatter.featuredImage}
          tags={markdownRemark.fields.tags}/>
        }
        <!-- Ezoic - under_page_title - under_page_title -->
        <div id="ezoic-pub-ad-placeholder-101"> </div>
        <!-- End Ezoic - under_page_title - under_page_title -->
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
        excerpt
        disableComments
      }
      html
      id
      timeToRead
      fields {
        iso: postDate
        postDate(formatString: "MMMM Do, YYYY")
        tags {
          path
          name
        }
        categories {
          name
        }
      }
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
        disableComments: PropTypes.bool,
        daysAgo: PropTypes.number,
        title: PropTypes.string,
        featuredImage: PropTypes.shape({
          childImageSharp: PropTypes.shape({
            gatsbyImageData: PropTypes.object
          })
        }),
        excerpt: PropTypes.string
      }),
      fields: PropTypes.shape({
        iso: PropTypes.string,
        postDate: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.shape({
          key: PropTypes.string,
          name: PropTypes.string
        })),
        categories: PropTypes.arrayOf(PropTypes.shape({
          key: PropTypes.string,
          name: PropTypes.string
        }))
      }),
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
