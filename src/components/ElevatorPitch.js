import React from 'react';
import {OutboundLink} from 'gatsby-plugin-google-analytics';
import {Link, useStaticQuery} from 'gatsby';
import Img from 'gatsby-image';
import './ElevatorPitch.css';

const profileImageQuery = graphql`
  {
    profileImage: file(relativePath: {eq: "profile.jpeg"}) {
      childImageSharp {
        fixed(width: 120) {
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
      <h1 className="elevator-pitch__title">👋 Hey there, I'm Dimitri</h1>
      <p className="elevator-pitch__bio">
        I'm a passionate full-stack developer at Optis.
        You can often find me <OutboundLink href="https://github.com/g00glen00b">testing out</OutboundLink> new and interesting frameworks and <Link to="/category/t">blogging</Link> about them.
      </p>
    </div>
  );
}
