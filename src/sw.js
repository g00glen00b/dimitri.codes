importScripts('workbox-v4.3.1/workbox-sw.js');

if (workbox) {
  workbox.setConfig({modulePathPrefix: 'workbox-v4.3.1'});
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  workbox.precaching.precacheAndRoute([]);

  workbox.routing.registerRoute(
    /(\.js$|\.css$|static\/)/,
    new workbox.strategies.CacheFirst(),
    'GET'
  );
  workbox.routing.registerRoute(
    /^https?:.*\page-data\/.*\/page-data\.json/,
    new workbox.strategies.NetworkFirst({
      networkTimeoutSeconds: 1
    }),
    'GET'
  );
  workbox.routing.registerRoute(
    /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
    new workbox.strategies.StaleWhileRevalidate(),
    'GET'
  );

  workbox.googleAnalytics.initialize({
    parameterOverrides: {
      cd1: 'offline'
    }
  });
}
