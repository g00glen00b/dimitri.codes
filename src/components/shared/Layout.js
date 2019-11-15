import React from 'react';
import {css, Global} from '@emotion/core';
import styled from '@emotion/styled';
import themes from './theme';
import {SiteNav} from '../site/SiteNav';
import {SiteDivider} from '../site/SiteDivider';
import {SiteFooter} from '../site/SiteFooter';
import {ThemeProvider, withTheme} from 'emotion-theming';
import {graphql, useStaticQuery} from 'gatsby';

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
    
    article h2 {
      font-size: 35px;
    }
  
    article h3 {
      font-size: 30px;
    }
  
    article h4 {
      font-size: 23px;
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
    <ThemeProvider theme={themes.light}>
      <Container>
        <GlobalStyles/>
        <SiteNav title={data.site.siteMetadata.title}/>
        <main>{children}</main>
        <SiteDivider/>
        <SiteFooter origin={data.site.siteMetadata.siteOrigin}/>
      </Container>
    </ThemeProvider>
  );
};
