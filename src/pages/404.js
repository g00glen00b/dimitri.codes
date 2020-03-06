import React from 'react';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {NotFoundBox} from '../components/NotFoundBox';


const NotFoundPage = () => (
  <Layout simple>
    <SEO title="404: Not found" />
    <NotFoundBox/>
  </Layout>
);

export default NotFoundPage;
