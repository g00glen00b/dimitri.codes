// Kleuren mooi, slecht contrast theme
// import 'prism-themes/themes/prism-duotone-space.css';
// Klauren mooi, slecht contrast achtergrond
// import 'prism-themes/themes/prism-darcula.css';
// Kleuren mooi, slecht contrast achtergrond
// import 'prism-themes/themes/prism-dracula.css';
// Kleuren lelijk
// import 'prism-themes/themes/prism-material-oceanic.css';
// Kleuren mooi, contrast OK
// import 'prism-themes/themes/prism-atom-dark.css';
// Kleuren lelijk
// import 'prism-themes/themes/prism-material-dark.css';
import './src/OneDark.css';

export function onServiceWorkerUpdateReady() {
  console.log('onServiceWorkerUpdateReady');
  window.dispatchEvent(new Event('onServiceWorkerUpdate'));
}
