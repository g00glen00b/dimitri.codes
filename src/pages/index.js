import React from "react"
import {graphql, useStaticQuery} from "gatsby"
import {SiteIntro} from '../components/site/SiteIntro';
import {PostItem} from '../components/post/PostItem';
import {Layout} from '../components/shared/Layout';
import {SEO} from '../components/shared/Seo';
import {SiteDivider} from '../components/site/SiteDivider';
import {CallToAction} from '../components/shared/CallToAction';

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
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
            fields {
              readingTime {
                text
              }
            }
          }
        }
      }
    }
  `);

  return (
    <Layout>
      <SEO title="Home"/>
      <SiteIntro />
      <SiteDivider/>
      {data.allWordpressPost.edges.map(({node}) => (
        <PostItem
          key={node.id}
          date={node.date}
          tags={node.tags}
          readingTime={node.fields.readingTime}
          title={node.title}
          slug={node.slug}
          excerpt={node.excerpt}/>
      ))}
      <CallToAction
        description="There's more... I've been blogging for quite a while!"
        action="View all articles"
        link="/category/t"/>
    </Layout>
  );
};

export default IndexPage
