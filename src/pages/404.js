import React from 'react';
import {Seo} from '../components/Seo';
import {Layout} from '../components/Layout';
import {NotFoundBox} from '../components/NotFoundBox';


const NotFoundPage = () => (
  <Layout simple>
    <Seo title="404: Not found" />
    <NotFoundBox/>
  </Layout>
);

export default NotFoundPage;
