import {useEffect, useState} from 'react';

export function useEventTriggered(name) {
  const [isTriggered, setTriggered] = useState(false);

  useEffect(() => {
    const trigger = () => setTriggered(true);
    window.addEventListener(name, trigger);
    return () => window.removeEventListener(name, trigger);
  }, [name]);

  return [isTriggered];
}
