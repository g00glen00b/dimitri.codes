import React from 'react';
import styled from '@emotion/styled';
import {LinkButton} from './LinkButton';

export const ActionDiv = styled.div`
  background-color: rgba(0, 0, 0, .05);
  padding: 2em 4em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 800px) {
    padding: 2em;
  }
`;

export const CallToAction = ({description, action, link}) => (
  <ActionDiv>
    <span>{description}</span>
    <LinkButton to={link}>{action}</LinkButton>
  </ActionDiv>
);
