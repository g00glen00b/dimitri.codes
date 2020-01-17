import React from 'react';
import {OutboundLink} from 'gatsby-plugin-google-analytics';
import {FaCodepen, FaGithub, FaSpeakerDeck, FaTwitter} from 'react-icons/fa';
import {Link} from 'gatsby';
import './Footer.css';

export const Footer = () => (
  <footer className="footer">
    <ul className="footer__social">
      <li>
        <OutboundLink
          className="footer__social--link"
          href="https://twitter.com/g00glen00b"
          title="Twitter">
          <FaTwitter size={28}/>
        </OutboundLink>
      </li>
      <li>
        <OutboundLink
          className="footer__social--link"
          href="https://github.com/g00glen00b"
          title="GitHub">
          <FaGithub size={28}/>
        </OutboundLink>
      </li>
      <li>
        <OutboundLink
          className="footer__social--link"
          href="https://speakerdeck.com/g00glen00b"
          title="Speaker Deck">
          <FaSpeakerDeck size={28}/>
        </OutboundLink>
      </li>
      <li>
        <OutboundLink
          className="footer__social--link"
          href="https://codepen.io/g00glen00b/"
          title="CodePen">
          <FaCodepen size={28}/>
        </OutboundLink>
      </li>
    </ul>
    <nav className="footer__links">
      <Link to="/privacy-policy">Privacy policy</Link>
      <OutboundLink href="https://github.com/g00glen00b/gatsby-blog/issues">Post an idea</OutboundLink>
      <Link to="/contact">Contact</Link>
      <Link to="https://dimitr.im/rss.xml">RSS</Link>
    </nav>
  </footer>
);
