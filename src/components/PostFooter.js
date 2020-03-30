import {OutboundLink} from 'gatsby-plugin-google-analytics';
import {Link} from 'gatsby';
import React from 'react';
import './PostFooter.css';
import PropTypes from 'prop-types';

export const PostFooter = ({url}) => (
  <p className="post-footer">
    <Link to="/category/tutorials">Back to tutorials</Link>
    <span className="post-footer__divider">&bull;</span>
    <OutboundLink
      href="https://github.com/g00glen00b/gatsby-blog/issues"
      target="_blank"
      rel="noopener noreferrer">
        Report an issue on GitHub
    </OutboundLink>
    <span className="post-footer__divider">&bull;</span>
    <OutboundLink
      href={`https://twitter.com/search?q=${encodeURIComponent(url)}`}
      target="_blank"
      rel="noopener noreferrer">
        Discuss on Twitter
    </OutboundLink>
  </p>
);

PostFooter.propTypes = {
  url: PropTypes.string
};
