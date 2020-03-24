import {OutboundLink} from 'gatsby-plugin-google-analytics';
import {Link} from 'gatsby';
import React from 'react';
import './PostFooter.css';
import PropTypes from 'prop-types';

export const PostFooter = ({url}) => (
  <p className="post-footer">
    <Link to="/category/t">Back to tutorials</Link>
    <span className="post-footer__divider">&bull;</span>
    <OutboundLink
      href="https://github.com/g00glen00b/gatsby-blog"
      target="_blank"
      rel="noopener noreferrer">
        Contact me on GitHub
    </OutboundLink>
    <span className="post-footer__divider">&bull;</span>
    <OutboundLink
      href={`https://twitter.com/search?q=${encodeURIComponent(url)}`}
      target="_blank"
      rel="noopener noreferrer">
        Discuss on Twitter
    </OutboundLink>
    <span className="post-footer__divider">&bull;</span>
  </p>
);

PostFooter.propTypes = {
  url: PropTypes.string
};
