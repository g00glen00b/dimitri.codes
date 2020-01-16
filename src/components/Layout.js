import React from 'react';
import './Layout.css';
import {Header} from './Header';

export const Layout = ({children}) => (
  <div className="container">
    <Header/>
    <main className="container__content">
      {children}
    </main>
  </div>
);
