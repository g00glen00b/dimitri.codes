import ImageProvider from './src/imageProvider';

// Use a single context for keeping a reference to all images
// This makes it easier to replace inline WordPress images with Gatsby image
export const wrapRootElement = ImageProvider;
