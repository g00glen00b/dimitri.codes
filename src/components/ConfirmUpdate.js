import React, {useEffect, useState} from 'react';
import './ConfirmUpdate.css';

function useServiceWorkerUpdate() {
  const [isUpdate, setUpdate] = useState(false);
  const updateListener = () => {
    setUpdate(true);
    setTimeout(() => setUpdate(false), 10000);
  };
  useEffect(() => {
    window.addEventListener('serviceWorkerUpdate', updateListener);
    return () => window.removeEventListener('serviceWorkerUpdate', updateListener);
  });
  return [isUpdate];
}

export const ConfirmUpdate = () => {
  const [isUpdate] = useServiceWorkerUpdate();
  return (
    <>
      {isUpdate && <div className="confirm__update">
        The application has been updated. Do you wish to reload?
        <button
          className="confirm__update--action"
          onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>}
    </>
  );
}
