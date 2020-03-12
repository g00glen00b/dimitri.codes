import React from 'react';
import {Button} from './Button';
import {useServiceWorker, useServiceWorkerMessage, useServiceWorkerUpdate} from '../helpers/hooks/serviceWorkerHooks';
import {useInterval} from '../helpers/hooks/genericHooks';


export const UpdateToaster = () => {
  const [registration] = useServiceWorker('/sw.js');
  const [updatedServiceWorker, setUpdated] = useServiceWorkerUpdate(registration);
  useServiceWorkerMessage();

  useInterval(() => registration && registration.update(), 1 * 60 * 1000);

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
