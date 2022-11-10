import React from 'react';
import {graphql} from 'gatsby';
import {Layout} from '../components/Layout';
import PropTypes from 'prop-types';
import {PageTitle} from '../components/PageTitle';
import {Comments} from '../components/Comments';
import {Seo} from "../components/Seo";

const Post = ({data: {markdownRemark}}) => {
    const isPage = markdownRemark.frontmatter.categories.includes('Pages');
    const isCommentsDisabled = markdownRemark.frontmatter.disableComments || false;
    return (
      <Layout>
        {!isPage && <PageTitle
          title={markdownRemark.frontmatter.title}
          timeToRead={!isPage && markdownRemark.timeToRead}
          date={markdownRemark.fields.postDate}
          featuredImage={markdownRemark.frontmatter.featuredImage}
          tags={markdownRemark.fields.tags}/>
        }
        <div id="ezoic-pub-ad-placeholder-101"> </div>
        {isPage && <h1>{markdownRemark.frontmatter.title}</h1>}
        <div dangerouslySetInnerHTML={{__html: markdownRemark.html}}/>
        <div id="ezoic-pub-ad-placeholder-102"> </div>
        {isCommentsDisabled || <Comments/>}
      </Layout>
    );
}

export const query = graphql`
  query ($id: String!) {
    file(relativePath: {eq: "logo-square.png"}) {
      publicURL
    }
    site {
      siteMetadata {
        title
        description
        author
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

export const Head = ({location: {pathname}, data: {markdownRemark, site, file}}) => (
  <Seo
    siteUrl={site.siteMetadata.siteUrl}
    description={markdownRemark.frontmatter.excerpt || markdownRemark.excerpt}
    imageUrl={file.publicURL}
    author={site.siteMetadata.author}
    iconUrl={file.publicURL}
    title={markdownRemark.frontmatter.title}
    siteTitle={site.siteMetadata.title}
    path={pathname}
    tags={markdownRemark.fields.tags}
    categories={markdownRemark.fields.categories}
    publishedDate={markdownRemark.fields.iso} />
);

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
