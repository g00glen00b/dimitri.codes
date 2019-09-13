import {graphql, useStaticQuery} from 'gatsby';
import styled from '@emotion/styled';
import Img from 'gatsby-image';
import React from 'react';

const AuthorCardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({theme}) => theme.secondaryBackgroundColor};
  padding: 2em;
  margin: 2em 0;
`;

const AuthorImageWrapper = styled.div`
  width: 64px;
  height: 64px;
  margin-right: 2em;
`;

const AuthorInfo = styled.p`
  flex: auto;
  margin: 0;
`;

const AuthorImage = styled(props => <Img {...props}/>)`
  border-radius: 50%;
`;

export const AuthorCard = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          bio
        }
      }
      profileImage: file(relativePath: { eq: "profile.jpeg" }) {
        childImageSharp {
          fixed(width: 64) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `);

  return (
    <AuthorCardContainer>
      <AuthorImageWrapper>
        <AuthorImage
          fixed={data.profileImage.childImageSharp.fixed}
          alt="Profile picture"/>
      </AuthorImageWrapper>
      <AuthorInfo>
        {data.site.siteMetadata.bio}
      </AuthorInfo>
    </AuthorCardContainer>
  );
};
