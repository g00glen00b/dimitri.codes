const environment = process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || 'development';
require('dotenv').config({path: `.env.${environment}`});
const gatsbyWordpress = require('./config/gatsby-wordpress');
const gatsbySeo = require('./config/gatsby-seo');

module.exports = {
  siteMetadata: {
    title: `Dimitri's tutorials`,
    description: `Dimitri's tutorials about software development with Java and JavaScript`,
    author: `@g00glen00b`,
    siteUrl: process.env.SITE_URL,
    siteOrigin: new Date('2012-07-01')
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    ...gatsbyWordpress,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-emotion`,
    ...gatsbySeo
  ],
};
