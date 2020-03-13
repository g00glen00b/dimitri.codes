import React from 'react';
import './Layout.css';
import {Header} from './Header';
import {Footer} from './Footer';

export const Layout = ({children, simple}) => (
  <div className="container">
    {!simple && <Header/>}
    <main className="container__content">
      {children}
    </main>
    {!simple && <Footer/>}
  </div>
);
