import {graphql, useStaticQuery} from 'gatsby';
import styled from '@emotion/styled';
import Img from 'gatsby-image';
import React from 'react';

const PostCardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({theme}) => theme.secondaryBackgroundColor};
  padding: 2em;
  margin: 2em 0;
`;

const PostCardImageWrapper = styled.div`
  width: 64px;
  height: 64px;
  margin-right: 2em;
`;

const PostCardInfo = styled.p`
  flex: auto;
  margin: 0;
`;

const PostCardImage = styled(props => <Img {...props}/>)`
  border-radius: 50%;
`;



export const PostCard = () => {
  const data = useStaticQuery(graphql`
    query {
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
    <PostCardContainer>
      <PostCardImageWrapper>
        <PostCardImage
          fixed={data.profileImage.childImageSharp.fixed}
          alt="Profile picture"/>
      </PostCardImageWrapper>
      <PostCardInfo>
        Dimitri "g00glen00b" Mestdagh is a consultant at Cronos and tech lead at Aquafin.<br/>
        Usually you can find him trying out new libraries and technologies. Loves both Java and JavaScript.
      </PostCardInfo>
    </PostCardContainer>
  );
};
