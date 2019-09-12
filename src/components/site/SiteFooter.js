import React from 'react';
import {FaCodepen, FaGithub, FaKeybase, FaRss, FaSpeakerDeck, FaStackOverflow, FaTwitter} from 'react-icons/fa';
import {IconContext} from 'react-icons';
import styled from '@emotion/styled';
import {OutboundLink} from 'gatsby-plugin-google-analytics';
import {withTheme} from 'emotion-theming';

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

const ThemeIconContext = withTheme(({theme, children}) => (
  <IconContext.Provider value={{color: theme.iconColor, size: '1.6em'}}>
    {children}
  </IconContext.Provider>
));

export const SiteFooter = ({origin}) => (
  <Footer>
    <SocialLinks>
      <ThemeIconContext>
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
        <FooterLink
          href="./rss.xml"
          title="RSS feed"
          target="_blank">
          <FaRss/>
        </FooterLink>
      </ThemeIconContext>
    </SocialLinks>
    <Copyright>
      &copy; {origin} - {new Date().getFullYear()} &mdash; Dimitri 'g00glen00b' Mestdagh.<br />
      Content licensed under <OutboundLink href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">cc by-sa 4.0</OutboundLink> with attribution required.
    </Copyright>
  </Footer>
);
