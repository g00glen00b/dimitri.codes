import React from 'react';
import {FaCodepen, FaGithub, FaKeybase, FaSpeakerDeck, FaStackOverflow, FaTwitter} from 'react-icons/fa';
import {IconContext} from "react-icons";
import styled from '@emotion/styled';
import {iconColor} from '../../theme';
import {OutboundLink} from 'gatsby-plugin-google-analytics';

const Footer = styled.footer`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const Copyright = styled.p`
  opacity: 0.8;
  text-align: center;
  font-size: 0.8em;
`;

const FooterLink = styled(props => <OutboundLink {...props}/>)`
    display: inline-block;
    margin: 0 0.5em;
`;

export const SiteFooter = ({origin}) => (
  <Footer>
    <SocialLinks>
      <IconContext.Provider value={{ color: iconColor, size: '1.6em' }}>
        <FooterLink
          href="https://twitter.com/g00glen00b"
          title="Twitter"
          target="_blank">
          <FaTwitter/>
        </FooterLink>
        <FooterLink
          href="https://github.com/g00glen00b"
          title="GitHub"
          target="_blank">
          <FaGithub/>
        </FooterLink>
        <FooterLink
          href="https://stackoverflow.com/users/1915448"
          title="Stack Overflow"
          target="_blank">
          <FaStackOverflow/>
        </FooterLink>
        <FooterLink
          href="https://codepen.io/g00glen00b"
          title="Codepen"
          target="_blank">
          <FaCodepen/>
        </FooterLink>
        <FooterLink
          href="https://keybase.io/g00glen00b"
          title="Keybase"
          target="_blank">
          <FaKeybase/>
        </FooterLink>
        <FooterLink
          href="https://speakerdeck.com/g00glen00b"
          title="Speaker Deck"
          target="_blank">
          <FaSpeakerDeck/>
        </FooterLink>
      </IconContext.Provider>
    </SocialLinks>
    <Copyright>
      &copy; {origin} - {new Date().getFullYear()} &mdash; Dimitri 'g00glen00b' Mestdagh.<br />
      Content licensed under <OutboundLink href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">cc by-sa 4.0</OutboundLink> with attribution required.
    </Copyright>
  </Footer>
);
