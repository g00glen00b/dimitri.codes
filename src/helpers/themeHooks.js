import {useEffect, useState} from 'react';

export function useLocalTheme(initialTheme) {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => setTheme(localStorage.getItem('theme') || initialTheme), [initialTheme, setTheme]);
  return [theme, newTheme => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  }];
}

export function usePreferredTheme(initialTheme) {
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

export function useAttributeTheme(theme) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}
