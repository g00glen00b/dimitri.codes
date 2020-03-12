import ImageProvider from './src/imageProvider';

// Use a single context for keeping a reference to all images
// This makes it easier to replace inline WordPress images with Gatsby image
export const wrapRootElement = ImageProvider;

// Set __swUpdated to false so that a refresh isn't automatically triggered
// https://github.com/gatsbyjs/gatsby/blob/8938c953003e2fb488c2ae72f2eb966d0db16833/packages/gatsby/cache-dir/navigation.js#L68
export const onServiceWorkerUpdateReady = () => window.___swUpdated = false;
