import './src/OneDark.css';

export function onServiceWorkerUpdateReady() {
  window.dispatchEvent(new Event('onServiceWorkerUpdate'));
}
