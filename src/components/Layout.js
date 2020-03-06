import React from 'react';
import './Layout.css';
import {Header} from './Header';
import {Footer} from './Footer';
import {ConfirmUpdate} from './ConfirmUpdate';

export const Layout = ({children}) => (
  <div className="container">
    <Header/>
    <main className="container__content">
      {children}
    </main>
    <Footer/>
    <ConfirmUpdate/>
  </div>
);
