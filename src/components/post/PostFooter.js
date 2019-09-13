import {Link} from 'gatsby';
import {OutboundLink} from 'gatsby-plugin-google-analytics';
import React from 'react';
import styled from '@emotion/styled';

const LinkContainer = styled.p`
  margin: 2em 0 0;
`;

const LinkDivider = styled.span`
  margin: 0 0.5em;
  color: ${({theme}) => theme.textColor};
`;

export const PostFooter = ({postUrl}) => (
  <LinkContainer>
    <Link to={`/category/t`}>
      Back to tutorials
    </Link>
    <LinkDivider>&bull;</LinkDivider>
    <OutboundLink href="https://twitter.com/g00glen00b" target="_blank">
      Contact me on Twitter
    </OutboundLink>
    <LinkDivider>&bull;</LinkDivider>
    <OutboundLink
      href={`https://twitter.com/search?q=${encodeURIComponent(postUrl)}`}
      target="_blank">
      Discuss on Twitter
    </OutboundLink>
  </LinkContainer>
);
