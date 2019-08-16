import React from 'react';
import styled from '@emotion/styled';
import {textColor, textFont} from '../../theme';

const SiteIntroTitle = styled.h1`
  font-family: ${textFont};
  font-size: 3em;
  color: ${textColor};
  margin: 20px 0 0;
`;

const SiteIntroHello = styled.small`
  font-size: 0.5em;
  color: ${textColor};
  font-weight: 300;
  display: block;
`;

const SiteIntroDescription = styled.h2`
  margin: 10px 0 20px;
  font-family: ${textFont};
  color: ${textColor};
  font-weight: 300;
`;

export const SiteIntro = () => (
  <>
    <SiteIntroTitle>
      <SiteIntroHello>👋 Hey there,</SiteIntroHello>
      I'm Dimitri
    </SiteIntroTitle>
    <SiteIntroDescription>
      I like trying out new frameworks and writing about them. Below you can find the latest articles I wrote.
    </SiteIntroDescription>
  </>
);
