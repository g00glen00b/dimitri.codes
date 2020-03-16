import React from 'react';
import {OutboundLink} from 'gatsby-plugin-google-analytics';
import {graphql, Link, useStaticQuery} from 'gatsby';
import Img from 'gatsby-image';
import './ElevatorPitch.css';

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

export const ElevatorPitch = () => {
  const {profileImage: {childImageSharp: {fixed: profileImage} = {}} = {}} = useStaticQuery(profileImageQuery);
  return (
    <div className="elevator-pitch">
      <Img className="elevator-pitch__image" fixed={profileImage}/>
      <h1 className="elevator-pitch__title">
        <span role="img" aria-label="Waving emoji">👋</span> Hey there, I&apos;m Dimitri
      </h1>
      <p className="elevator-pitch__bio">
        I&apos;m a full-stack developer who likes
        {` `}
        <OutboundLink
          href="https://github.com/g00glen00b"
          target="_blank"
          rel="noopener noreferrer">
          testing out
        </OutboundLink>
        {` `}
        new and interesting frameworks and
        {` `}
        <Link to="/category/tutorials">blogging</Link>
        {` `}
        about them.
        I prefer working with <strong>Java</strong> and <strong>JavaScript</strong>.
      </p>
    </div>
  );
}
