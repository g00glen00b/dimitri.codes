import React from 'react';
import {Button} from './Button';
import {useServiceWorker, useServiceWorkerUpdate} from '../helpers/serviceWorkerHooks';
import {useInterval} from '../helpers/genericHooks';


export const UpdateToaster = () => {
  const [registration] = useServiceWorker('/sw.js');
  const isInterval = registration != null && navigator.serviceWorker.controller != null;
  const [updatedServiceWorker, setUpdated] = useServiceWorkerUpdate(registration);

  useInterval(() => registration.update(), isInterval ? 30 * 60 * 1000 : null);

  function onUpdate() {
    updatedServiceWorker.postMessage({action: 'skipWaiting'});
    setUpdated();
  }

  return (
    <>
      {updatedServiceWorker && <Button onClick={onUpdate} type="button">Update</Button>}
    </>
  );
};
