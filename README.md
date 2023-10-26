# dimitri.codes

This is the source code of my personal blog at [https://dimitri.codes](https://dimitri.codes).
This project uses [Gatsby](https://www.gatsbyjs.org/), using [`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) to source Markdown blogposts.

The syntax highlighting theme is based on the [One Dark UI theme for Atom](https://atom.io/themes/one-dark-ui), which has been [ported to Prism.js](https://github.com/AGMStudio/prism-theme-one-dark). 

## Set up
To get started with this project, you have to configure an `.env.development` file containing the following environment variables:

```env
SITE_URL=
REPO_URL=
```

For example:

```env
SITE_URL=https://my-gatsby-site.com
REPO_URL=g00glen00b/dimitri.codes
```

After that, you can use the following commands to run the project:

```shell
npm install
npm start
```

This will run a local web server on [http://localhost:8080](http://localhost:8080).

## Features

- Markdown for page content using [remark](https://github.com/remarkjs/remark) as a processor.
- Syntax highlighting using [Prism](https://prismjs.com/) with the [One Dark UI theme](https://atom.io/themes/one-dark-ui).
- Support for categories and tags.
- Following [Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/) for color contrasts.
- Support for featured images.
- Support for manual excerpts.

## License

The blogposts written for [dimitri.codes](https://dimitri.codes/) are copyrighted.
Code snippets within the blogposts and the code used for generating this website are licensed as [MIT](https://opensource.org/licenses/MIT).  
