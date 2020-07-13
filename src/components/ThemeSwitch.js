import React from 'react';
import {IoIosMoon, IoIosSunny} from 'react-icons/io';
import './ThemeSwitch.css';
import {useAttributeTheme, useLocalTheme, usePreferredTheme} from '../helpers/hooks/themeHooks';

export const ThemeSwitch = () => {
  const [preferredTheme] = usePreferredTheme('light');
  const [localTheme, setLocalTheme] = useLocalTheme(preferredTheme);
  const isDark = localTheme === 'dark';
  useAttributeTheme(localTheme);
  return <>
    <input
      type="checkbox"
      checked={isDark}
      id="theme-switch"
      onChange={({target: {checked}}) => setLocalTheme(checked ? 'dark' : 'light')}
    />
    <label htmlFor="theme-switch">
      {isDark ? <IoIosMoon/> : <IoIosSunny/>}
    </label>
  </>;
};
