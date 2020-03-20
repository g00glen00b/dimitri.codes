import React from 'react';
import {OutboundLink} from 'gatsby-plugin-google-analytics';
import PropTypes from 'prop-types';
import './SoftwareLicenses.css';

export const SoftwareLicenses = ({licenseNodes = []}) => (
  <ul className="software-licenses">
    {licenseNodes.map(({node: {license, label, url}}) => (
      <li
        className="software-licenses__library"
        key={label}>
        <OutboundLink
          href={url}
          target="_blank"
          rel="noopener noreferrer">
          {label}
        </OutboundLink>
        <small className="software-licenses__license">
          ({license})
        </small>
      </li>
    ))}
  </ul>
);

SoftwareLicenses.propTypes = {
  licenseNodes: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      license: PropTypes.string,
      label: PropTypes.string,
      url: PropTypes.string
    })
  }))
};
