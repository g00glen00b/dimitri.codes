import React from 'react';
import {OutboundLink} from 'gatsby-plugin-google-analytics';
import {FaCodepen, FaGithub, FaSpeakerDeck, FaTwitter} from 'react-icons/fa';
import {graphql, Link, useStaticQuery} from 'gatsby';
import './Footer.css';

const footerLinksQuery = graphql`
  query {
    site {
      siteMetadata {
        footerLinks {
          name
          to
          outbound
        }
        socialNetworks {
          twitter
          codepen
          speakerdeck
          github
        }
      }
    }
  }
`;

export const Footer = () => {
  const {site: {siteMetadata: {footerLinks = [], socialNetworks = {}} = {}} = {}} = useStaticQuery(footerLinksQuery);
  return (
    <footer className="footer">
      <ul className="footer__social">
        {socialNetworks.twitter && <li>
          <OutboundLink
            className="footer__social--link"
            href={`https://twitter.com/${socialNetworks.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Twitter">
            <FaTwitter size={20}/>
          </OutboundLink>
        </li>}
        {socialNetworks.github && <li>
          <OutboundLink
            className="footer__social--link"
            href={`https://github.com/${socialNetworks.github}`}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub">
            <FaGithub size={20}/>
          </OutboundLink>
        </li>}
        {socialNetworks.speakerdeck && <li>
          <OutboundLink
            className="footer__social--link"
            href={`https://speakerdeck.com/${socialNetworks.speakerdeck}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Speaker Deck">
            <FaSpeakerDeck size={20}/>
          </OutboundLink>
        </li>}
        {socialNetworks.codepen && <li>
          <OutboundLink
            className="footer__social--link"
            href={`https://codepen.io/${socialNetworks.codepen}`}
            target="_blank"
            rel="noopener noreferrer"
            title="CodePen">
            <FaCodepen size={20}/>
          </OutboundLink>
        </li>}
      </ul>
      <nav className="footer__links">
        {footerLinks.map(({name, to, outbound}) => outbound ? (
            <OutboundLink
              href={to}
              key={name}
              target="_blank"
              rel="noopener noreferrer">
              {name}
            </OutboundLink>
          ) : (
            <Link
              to={to}
              key={name}>
              {name}
            </Link>
          )
        )}
      </nav>
    </footer>
  );
}
