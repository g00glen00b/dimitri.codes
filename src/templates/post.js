import React from 'react';
import {graphql} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {PostFooter} from '../components/PostFooter';
import {Tags} from '../components/Tags';
import {getSectionMetadata, getTagMetadata, getTimeMetadata} from '../helpers/metadataHelpers';
import {ElevatorPitch} from '../components/ElevatorPitch';

const Post = ({data: {markdownRemark, site}}) => {
    const isPage = markdownRemark.frontmatter.categories.includes('Pages');
    return (
      <Layout>
          <SEO
            title={markdownRemark.frontmatter.title}
            description={markdownRemark.excerpt}
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
