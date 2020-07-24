import React from 'react';
import './ContainerContent.css';
import PropTypes from 'prop-types';

export const ContainerContent = ({children}) => (
  <main className="container-content">
    {children}
  </main>
);

ContainerContent.propTypes = {
  children: PropTypes.node
};
