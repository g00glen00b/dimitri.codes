import React from 'react';
import './Layout.css';
import {Header} from './Header';
import {Footer} from './Footer';
import {UpdateBar} from './UpdateBar';
import PropTypes from 'prop-types';

export const Layout = ({children, simple}) => (
  <div className="container">
    {!simple && <Header/>}
    <main className="container__content">
      {children}
    </main>
    {!simple && <Footer/>}
    <UpdateBar/>
  </div>
);

Layout.propTypes = {
  simple: PropTypes.bool,
  children: PropTypes.object
};
