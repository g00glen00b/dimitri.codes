import React from 'react';
import {IoIosMoon, IoIosSunny} from 'react-icons/io';
import './ThemeSwitch.css';
import {Button} from './Button';
import {useAttributeTheme, useLocalTheme, usePreferredTheme} from '../helpers/themeHooks';

export const ThemeSwitch = () => {
  const [preferredTheme] = usePreferredTheme('light');
  const [localTheme, setLocalTheme] = useLocalTheme(preferredTheme);
  useAttributeTheme(localTheme);
  return <Button
    isSimple
    className="theme-switch__button"
    title="Switch theme"
    onClick={() => setLocalTheme(localTheme === 'dark' ? 'light' : 'dark')}>
    {localTheme === 'dark' ? <IoIosSunny size={16}/> : <IoIosMoon size={16}/>}
  </Button>;
};
