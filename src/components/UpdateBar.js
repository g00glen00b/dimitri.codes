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
        This website has been updated since the last time you visited.
        <button
          className="update-bar__action"
          onClick={reload}>
          Update
        </button>
      </div>}
    </>
  );
};
