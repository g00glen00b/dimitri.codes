import React, {useEffect, useState} from 'react';
import {IoIosMoon, IoIosSunny} from 'react-icons/io';
import './ThemeSwitch.css';

function useLocalTheme(initialTheme) {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => setTheme(localStorage.getItem('theme') || initialTheme));
  return [theme, newTheme => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  }];
}

function usePreferredTheme(initialTheme) {
  const [theme, setTheme] = useState(initialTheme);
  const updateMatch = ({matches}) => setTheme(matches ? 'dark' : 'light');
  useEffect(() => {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    updateMatch(mediaQueryList);
    mediaQueryList.addEventListener('change', updateMatch);
    return () => mediaQueryList.removeEventListener('change', updateMatch);
  }, [initialTheme]);
  return [theme];
}

function useAttributeTheme(theme) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}

export const ThemeSwitch = () => {
  const [preferredTheme] = usePreferredTheme('light');
  const [localTheme, setLocalTheme] = useLocalTheme(preferredTheme);
  useAttributeTheme(localTheme);
  return <button
    className="theme-switch__button"
    title="Switch theme"
    onClick={() => setLocalTheme(localTheme === 'dark' ? 'light' : 'dark')}>
    {localTheme === 'dark' ? <IoIosSunny size={16}/> : <IoIosMoon size={16}/>}
  </button>;
};
