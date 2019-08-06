import React from "react"
import {graphql, useStaticQuery} from "gatsby"
import SEO from "../components/Seo"
import {Layout} from '../components/Layout';
import {SiteIntro} from '../components/site/SiteIntro';
import {PostItem} from '../components/post/PostItem';
import {SiteDivider} from '../theme';
import {CallToAction} from '../components/CallToAction';

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
        }
      }
      
      allWordpressPost(sort: {fields: [date], order:DESC}, limit: 5) {
        edges {
          node {
            id
            date(formatString: "MMMM Do, YYYY")
            title
            excerpt
            slug
            tags {
              id
              slug
              name
            }
            readingTime {
              text
            }
          }
        }
      }
    }
  `);

  return (
    <Layout>
      <SEO title="Home"/>
      <SiteIntro {...data.site.siteMetadata}/>
      <SiteDivider/>
      {data.allWordpressPost.edges.map(({node}) => (
        <PostItem key={node.id} {...node} />
      ))}
      <CallToAction
        description="There's more... I've been blogging for quite a while!"
        action="View all articles"
        link="/category/t"/>
    </Layout>
  );
};

export default IndexPage
