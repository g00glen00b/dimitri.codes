import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import './Footer.css';
import {TiHeart} from 'react-icons/ti';
import {SocialLinks} from './SocialLinks';
import {ContentLinks} from './ContentLinks';

const footerLinksQuery = graphql`
  query {
    site {
      siteMetadata {
        authorName
        footerLinks {
          name
          to
          outbound
        }
        socialNetworks {
          twitter
          mastodon
          codepen
          speakerdeck
          github
        }
      }
    }
  }
`;

export const Footer = () => {
  const {site: {siteMetadata: {authorName = '', footerLinks = [], socialNetworks = {}} = {}} = {}} = useStaticQuery(footerLinksQuery);
  return (
    <footer className="footer">
      <div className="footer-content">
        <SocialLinks socialNetworks={socialNetworks}/>
        <ContentLinks links={footerLinks}/>
        <p className="copyright">
          Made with <TiHeart/> by {authorName}
        </p>
      </div>
    </footer>
  );
}
