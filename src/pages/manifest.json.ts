import {CONFIG} from '../config/config.ts';


export async function GET() {
  const icons = CONFIG.manifest.iconSizes.map(size => ({
    src: `/favicon-${size}.png`,
    type: `image/png`,
    sizes: `${size}x${size}`,
  }));

  const manifest = {
    name: CONFIG.site.title,
    description: CONFIG.site.description,
    start_url: '/',
    display: CONFIG.manifest.display,
    'background_color': CONFIG.manifest.backgroundColor,
    'theme_color': CONFIG.manifest.themeColor,
    icons,
  };

  return new Response(JSON.stringify(manifest))
}