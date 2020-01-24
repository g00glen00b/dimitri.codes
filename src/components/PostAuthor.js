import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import Img from 'gatsby-image';
import './PostAuthor.css';
import {Button} from './Button';

const profileImageQuery = graphql`
  {
    profileImage: file(relativePath: {eq: "profile.jpeg"}) {
      childImageSharp {
        fixed(width: 100) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`;

export const PostAuthor = () => {
  const {profileImage: {childImageSharp: {fixed: profileImage} = {}} = {}} = useStaticQuery(profileImageQuery);
  return (
    <div className="author">
      <Img
        fixed={profileImage}
        className="author__image"/>
      <p className="author__info">
        Hey, did you like this post? If you did, make sure to share it on social media.
        Also, since this site is running without any advertisements or sponsorship, feel free to donate.
      </p>
      <div className="author__donate">
        <Button
          isLink
          isOutbound
          href="https://ko-fi.com/dimitrim">
          Donate
        </Button>
      </div>
    </div>
  );
}
