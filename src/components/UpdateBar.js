import './UpdateBar.css';
import React from 'react';
import {useEventTriggered} from '../hooks/serviceWorkerHooks';

function reload() {
  window.location.reload();
}

export const UpdateBar = () => {
  const [isUpdate] = useEventTriggered('onServiceWorkerUpdate');
  return (
    <>
      {isUpdate && <div className="update-bar">
        This website has been updated since the last time you visited.
        <button
          className="update-bar-action"
          onClick={reload}>
          Update
        </button>
      </div>}
    </>
  );
};
