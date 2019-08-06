import React from 'react';
import PropTypes from 'prop-types';
import {graphql, useStaticQuery} from 'gatsby';
import {SiteNav} from './site/SiteNav';
import {css, Global} from '@emotion/core';
import styled from '@emotion/styled';
import {codeFont, maxWidth, SiteDivider, textColor, textFont} from '../theme';
import {SiteFooter} from './site/SiteFooter';

const Container = styled.div`
  max-width: ${maxWidth};
  margin: 0 auto;
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
          
          h3 {
            font-size: 2em;
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
      `}
      />
     <SiteNav title={data.site.siteMetadata.title}/>
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0px 1.0875rem 1.45rem`,
          paddingTop: 0,
        }}
      >
        <main>{children}</main>
        <SiteDivider/>
        <SiteFooter origin={data.site.siteMetadata.siteOrigin}/>
      </div>
    </Container>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
