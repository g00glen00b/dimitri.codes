import './src/OneDark.css';

export function onServiceWorkerUpdateReady() {
  console.log('onServiceWorkerUpdateReady');
  window.dispatchEvent(new Event('onServiceWorkerUpdate'));
}
