import React from 'react';
import styled from '@emotion/styled';
import {secondaryColor, textFont} from '../../theme';

const SiteIntroTitle = styled.h1`
  text-align: center;
  font-family: ${textFont};
  text-transform: uppercase;
  font-size: 3em;
  color: ${secondaryColor};
`;

const SiteIntroDescription = styled.h2`
  text-align: center;
  font-family: ${textFont};
  font-weight: 300;
  max-width: 400px;
  margin: 0 auto 20px;
`;

export const SiteIntro = ({title, description}) => (
  <>
    <SiteIntroTitle>{title}</SiteIntroTitle>
    <SiteIntroDescription>{description}</SiteIntroDescription>
  </>
);
