import React from 'react';
import styled from '@emotion/styled';
import {IoIosMoon, IoIosSunny} from 'react-icons/io';

const InlineContainer = styled.div`
  display: inline-block;
`;

const HiddenInput = styled.input`
  display: none;
`;

const DarkModeLabel = styled.label`
  display: inline-block;
  background-color: #222222;
  border-radius: 10px;
  height: 22px;
  width: 40px;
  padding: 1px;
  position: relative;
  cursor: pointer;
  
  &:before {
    content: '';
    display: inline-block;
    position: absolute;
    background: white;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    transition: margin .3s;
    z-index: 101;
  }
  
  *:checked+&::before {
    margin-left: calc(100% - 22px);
  }
`;

const DarkModeIcon = styled.span`
  color: yellow;
  font-size: 14px;
  line-height: 14px;
  z-index: 100;
  position: absolute;
  padding: 3px;
  
  &:first-of-type {
    left: 0;
  }
  
  &:last-of-type {
    right: 0;
  }
`;


export const DarkModeToggle = ({useDarkMode, onChange}) => {
  return (
    <InlineContainer>
      <HiddenInput
        type="checkbox"
        id="dark-mode"
        checked={useDarkMode}
        onChange={({target: {checked}}) => onChange(checked)}/>
      <DarkModeLabel
        title="Change dark mode"
        htmlFor="dark-mode"
        aria-label="Change dark mode">
        <DarkModeIcon>
          <IoIosMoon/>
        </DarkModeIcon>
        <DarkModeIcon>
          <IoIosSunny/>
        </DarkModeIcon>
      </DarkModeLabel>
    </InlineContainer>
  );
};
