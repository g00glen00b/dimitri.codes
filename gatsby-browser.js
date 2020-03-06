import ImageProvider from './src/imageProvider';

export const wrapRootElement = ImageProvider;

export const onServiceWorkerUpdateFound = () => {
  const serviceWorkerUpdateEvent = new Event('serviceWorkerUpdate');
  window.dispatchEvent(serviceWorkerUpdateEvent);
};
