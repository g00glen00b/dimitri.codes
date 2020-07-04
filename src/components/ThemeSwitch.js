import React from 'react';
import {IoIosMoon, IoIosSunny} from 'react-icons/io';
import './ThemeSwitch.css';
import {useAttributeTheme, useLocalTheme, usePreferredTheme} from '../helpers/hooks/themeHooks';

export const ThemeSwitch = () => {
  const [preferredTheme] = usePreferredTheme('light');
  const [localTheme, setLocalTheme] = useLocalTheme(preferredTheme);
  useAttributeTheme(localTheme);
  return <button
    title="Switch theme"
    className="button-secondary theme-switch"
    onClick={() => setLocalTheme(localTheme === 'dark' ? 'light' : 'dark')}>
    {localTheme === 'dark' ? <IoIosSunny size={16}/> : <IoIosMoon size={16}/>}
  </button>;
};
