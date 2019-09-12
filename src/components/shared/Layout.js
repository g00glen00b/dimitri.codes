import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import {css, Global} from '@emotion/core';
import styled from '@emotion/styled';
import themes from './theme';
import {SiteNav} from '../site/SiteNav';
import {SiteDivider} from '../site/SiteDivider';
import {SiteFooter} from '../site/SiteFooter';
import {ThemeProvider, withTheme} from 'emotion-theming';
import {DarkModeToggle} from './DarkModeToggle';
import useLocalStorage from 'react-use-localstorage';
import {useMedia} from 'react-use-media';

const ToggleContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
`;

const Container = styled.div`
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
  padding: 0 20px;
`;

const GlobalStyles = withTheme(({theme}) => (
  <Global styles={css`
    * {
      box-sizing: border-box;
      font-family: ${theme.textFont};
      transition: background .3s, color .3s, border .3s;
    }
    
    html, body {
      background: ${theme.backgroundColor};
    }
    
    pre, code, pre *, code * {
      font-family: ${theme.codeFont};
    }
    
    h1, h2, h3, h4, h5, h6, p, ul, ol, li {
      color: ${theme.textColor};
    }
    
    p > code {
      background-color: ${theme.secondaryBackgroundColor};
      padding: 0 3px;
    } 
    
    strong {
      font-weight: 500;
    }
    
    a {
      color: ${theme.primaryColor};
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-weight: 500;
    }
    
    p {
      line-height: 1.7em;
    }
    
    .wp-block-image img, p > a > img.size-full {
      max-width: 100%;
      height: auto;
    }
    
    .aligncenter {
      text-align: center;
    }
    
    article h2, article h3 {
      font-size: 30px;
    }
    
    article p, article li {
      line-height: 1.7em;
      font-size: 18px;
    }
    
    article a[href$=png], article a[href$=jpg], article a[href$=gif], article a[href$=jpeg] {
      display: flex;
      justify-content: center;
    }
  `}/>
));

export const Layout = ({ children }) => {
  const isDarkPreferred = useMedia({prefersColorScheme: 'dark'});
  const [theme, setTheme] = useLocalStorage('theme');
  const isDark = theme === '' ? isDarkPreferred : theme === 'dark';
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          siteOrigin(formatString: "YYYY")
        }
      }
    }
  `);

  return (
    <ThemeProvider theme={isDark ? themes.dark : themes.light}>
      <Container>
        <GlobalStyles/>
        <ToggleContainer>
          <DarkModeToggle
            useDarkMode={isDark}
            onChange={darkMode => setTheme(darkMode ? 'dark' : 'light')}/>
        </ToggleContainer>
        <SiteNav title={data.site.siteMetadata.title}/>
        <main>{children}</main>
        <SiteDivider/>
        <SiteFooter origin={data.site.siteMetadata.siteOrigin}/>
      </Container>
    </ThemeProvider>
  );
};
