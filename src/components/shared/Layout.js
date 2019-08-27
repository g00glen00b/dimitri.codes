import React from 'react';
import PropTypes from 'prop-types';
import {graphql, useStaticQuery} from 'gatsby';
import {css, Global} from '@emotion/core';
import styled from '@emotion/styled';
import {codeFont, maxWidth, textColor, textFont} from './theme';
import {SiteNav} from '../site/SiteNav';
import {SiteDivider} from '../site/SiteDivider';
import {SiteFooter} from '../site/SiteFooter';

const Container = styled.div`
  max-width: ${maxWidth};
  margin: 0 auto;
  padding: 0 20px;
`;

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
    <Container>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
            font-family: ${textFont};
          }
          
          pre, code, pre *, code * {
            font-family: ${codeFont};
          }
          
          h1, h2, h3, h4, h5, h6, p, span, a {
            color: ${textColor};
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
      `}
      />
      <SiteNav title={data.site.siteMetadata.title}/>
      <main>{children}</main>
      <SiteDivider/>
      <SiteFooter origin={data.site.siteMetadata.siteOrigin}/>
    </Container>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
