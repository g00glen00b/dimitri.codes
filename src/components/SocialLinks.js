import {FaCodepen, FaGithub, FaSpeakerDeck, FaTwitter, FaMastodon} from 'react-icons/fa';
import React from 'react';
import './SocialLinks.css';
import PropTypes from 'prop-types';

export const SocialLinks = ({socialNetworks}) => (
  <nav className="social-links">
    {socialNetworks.twitter && <a
      className="social-link"
      href={`https://twitter.com/${socialNetworks.twitter}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Twitter">
      <FaTwitter size={24}/>
    </a>}
    {socialNetworks.mastodon && <a
      className="social-link"
      href={`https://mastodon.cloud/@${socialNetworks.mastodon}`}
      target="_blank"
      rel="me noopener noreferrer"
      title="Mastodon">
      <FaMastodon size={24}/>
    </a>}
    {socialNetworks.github && <a
      className="social-link"
      href={`https://github.com/${socialNetworks.github}`}
      target="_blank"
      rel="noopener noreferrer"
      title="GitHub">
      <FaGithub size={24}/>
    </a>}
    {socialNetworks.speakerdeck && <a
      className="social-link"
      href={`https://speakerdeck.com/${socialNetworks.speakerdeck}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Speaker Deck">
      <FaSpeakerDeck size={24}/>
    </a>}
    {socialNetworks.codepen && <a
      className="social-link"
      href={`https://codepen.io/${socialNetworks.codepen}`}
      target="_blank"
      rel="noopener noreferrer"
      title="CodePen">
      <FaCodepen size={24}/>
    </a>}
  </nav>
);

SocialLinks.propTypes = {
  socialNetworks: PropTypes.shape({
    twitter: PropTypes.string,
    mastodon: PropTypes.string,
    github: PropTypes.string,
    speakerdeck: PropTypes.string,
    codepen: PropTypes.string
  })
};
