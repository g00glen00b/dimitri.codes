import {useEventTriggered} from '../helpers/hooks/serviceWorkerHooks';
import './UpdateBar.css';
import React from 'react';

function reload() {
  window.location.reload();
}

export const UpdateBar = () => {
  const [isUpdate] = useEventTriggered('onServiceWorkerUpdate');
  return (
    <>
      {isUpdate && <div className="update-bar">
        There is an update available.
        <button
          className="update-bar__action"
          onClick={reload}>
          Update
        </button>
      </div>}
    </>
  );
};
