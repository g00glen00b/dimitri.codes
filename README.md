# dimitr.im [![Netlify Status](https://api.netlify.com/api/v1/badges/7d74b2f7-8c18-46cc-8d56-477fc30997fd/deploy-status)](https://app.netlify.com/sites/dimitrim/deploys)

This is the source code of my personal blog at [https://dimit.im](https://dimitr.im).
This project uses [Gatsby](https://www.gatsbyjs.org/), using [`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) to source Markdown blogposts.

The syntax highlighting theme is based on the [One Dark UI theme for Atom](https://atom.io/themes/one-dark-ui), which has been [ported to Prism.js](https://github.com/AGMStudio/prism-theme-one-dark). 

## Set up
To get started with this project, you have to configure an `.env.development` file containing the following environment variables:

```env
SITE_URL=
GOOGLE_TRACKING_ID=
```

For example:

```env
SITE_URL=https://my-gatsby-site.com
GOOGLE_TRACKING_ID=UA-123456-78
```

After that, you can use the following commands to run the project:

```shell
npm install
npm start
```
