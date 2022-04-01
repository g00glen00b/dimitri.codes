const {siteMetadataQuery, feedItemQuery, getFeedItem} = require('./src/node/feed/helpers');
const environment = process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || 'development';

require('dotenv').config({path: `.env.${environment}`});

module.exports = {
  siteMetadata: {
    title: `Dimitri's tutorials`,
    description: `Dimitri's tutorials about software development with Java and JavaScript`,
    authorName: 'Dimitri Mestdagh',
    author: `@g00glen00b`,
    siteUrl: process.env.SITE_URL,
    utterances: {
      repoUrl: process.env.REPO_URL,
      theme: 'preferred-color-scheme',
      issueTerm: 'url',
      label: 'type: comments'
    },
    headerLinks: [
      {name: 'Home', to:'/'},
      {name: 'Tutorials', to: '/category/tutorials'},
      {name: 'Speaking', to: '/speaking'},
      {name: 'About me', to: '/about-me'}
    ],
    footerLinks: [
      {name: 'Privacy policy', to: '/privacy-policy'},
      {name: 'Post an idea', to: '/post-ideas'},
      {name: 'Contact', to: '/contact'},
      {name: 'RSS', to: 'https://dimitr.im/rss.xml', outbound: true}
    ],
    socialNetworks: {
      github: 'g00glen00b',
      codepen: 'g00glen00b',
      twitter: 'g00glen00b',
      speakerdeck: 'g00glen00b'
    }
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1024,
              backgroundColor: `transparent`,
              linkImagesToOriginal: false
            }
          },
          {
            resolve: `gatsby-remark-external-links`,
            options: {
              target: '_blank',
              rel: 'noopener noreferrer'
            }
          },
          `gatsby-remark-copy-linked-files`,
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              isIconAfterHeader: true
            }
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              noInlineHighlight: true
            }
          },
          `gatsby-remark-smartypants`
        ]
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/content/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/content/posts`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/content/pages`,
      },
    },
    {
      resolve: `gatsby-plugin-react-svg`,
      options: {
        rule: {
          include: /.*\.svg$/
        }
      }
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
            `Roboto:400,500`,
            `Roboto Mono:400,700`,
            `Montserrat:700`
        ]
      }
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: siteMetadataQuery,
        feeds: [{
          serialize: ({query: {site, allMarkdownRemark}}) => allMarkdownRemark.nodes.map(node => getFeedItem(site, node)),
          query: feedItemQuery,
          output: `/rss.xml`,
          title: `Dimitri's tutorial RSS feed`
        }]
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Dimitri's tutorials`,
        short_name: `Dimitri's tutorials`,
        start_url: `/`,
        background_color: `#FFFFFF`,
        theme_color: `#3E84CB`,
        display: `standalone`,
        icon: `content/images/logo-square.png`,
        include_favicon: false
      }
    },
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        workboxConfig: {
          runtimeCaching: [{
            urlPattern: /(\.js$|\.css$|static\/)/,
            handler: `CacheFirst`
          }, {
            urlPattern: /^https?:.*\/page-data\/.*\/(page-data|app-data)\.json$/,
            // Default is `StaleWhileRevalidate`, which causes stale data to appear
            // The reason this is applied is to increase performance.
            // To still allow immediate live data, without losing much performance, we're using `NetworkFirst` with a timeout of 1 second.
            // If we're unable to fetch the page data within that time, we'll rely on cache.
            handler: `NetworkFirst`,
            options: {
              networkTimeoutSeconds: 1
            }
          }]
        }
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GOOGLE_TRACKING_ID,
        head: false,
        anonymize: true,
        respectDNT: true
      }
    },
    `gatsby-plugin-robots-txt`,
  ],
};
