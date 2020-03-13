import React from 'react';
import {Button} from './Button';
import {useServiceWorker, useServiceWorkerUpdate} from '../helpers/hooks/serviceWorkerHooks';
import {useInterval} from '../helpers/hooks/genericHooks';


export const UpdateToaster = () => {
  const [registration] = useServiceWorker('/sw.js');
  const [updatedServiceWorker, setUpdated] = useServiceWorkerUpdate(registration);

  useInterval(() => registration && registration.update(), registration != null ? 60 * 1000 : null);

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
