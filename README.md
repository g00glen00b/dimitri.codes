# WordPress powered Gatsby blog
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
IMAGE_REPLACEMENT_FROM=
IMAGE_REPLACEMENT_TO=
```

While most of these are self-explanatory, the `URL_REPLACEMENT_FROM` and `URL_REPLACEMENT_TO` properties are used to rewrite links within each blogpost to properly match the new location (aka the Gatsby blog). Additionally, I'm using `IMAGE_REPLACEMENT_FROM` to rewrite the URL of the images, since my blog contains some images that aren't served over SSL, and could be used in the future to actually host these images on a CDN.

After that, you can use the following commands to run the project:

```shell
npm install
npm start
```
