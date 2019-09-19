# WordPress powered Gatsby blog [![Netlify Status](https://api.netlify.com/api/v1/badges/7d74b2f7-8c18-46cc-8d56-477fc30997fd/deploy-status)](https://app.netlify.com/sites/dimitrim/deploys)
This is my first project using [Gatsby](https://www.gatsbyjs.org/), using [gatsby-source-wordpress](https://www.gatsbyjs.org/packages/gatsby-source-wordpress/) to seed data from [my personal website](https://g00glen00b.be/).

## Set up
To get started with this project, you have to configure an `.env.development` file containing the following environment variables:

```env
SITE_URL=
WORDPRESS_API_HOST=
WORDPRESS_API_PROTOCOL=
GOOGLE_TRACKING_ID=
URL_REPLACEMENT_FROM=
URL_REPLACEMENT_TO=
```

While most of these are self-explanatory, the `URL_REPLACEMENT_FROM` and `URL_REPLACEMENT_TO` properties are used to rewrite links within each blogpost to properly match the new location (aka the Gatsby blog).

After that, you can use the following commands to run the project:

```shell
npm install
npm start
```
