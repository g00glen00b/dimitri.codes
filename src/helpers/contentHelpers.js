const possibleImageTags = ['p', 'img'];
const imageBlock = 'wp-block-image';
const codeClasses = ['wp-block-code', 'prettyprint', 'linenums', 'inline:true', 'decode:1', 'pre-scrollable', 'lang:default'];

export function kebabCase(name) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

export function isImage(node) {
  const {name: nodeName, attribs: {class: nodeClass = ''} = {}} = node;
  return possibleImageTags.includes(nodeName) || nodeClass.includes(imageBlock);
}

export function getImageNode(node) {
  if (node.name === 'img') {
    return node;
  } else if (node.children != null) {
    for (let index = 0; index < node.children.length; index++) {
      let image = getImageNode(node.children[index]);
      if (image != null) {
        return image;
      }
    }
  }
}

export function getImageFile(media, src) {
  const sourceUrl = src.replace(/(-e\d+|-\d+x\d+)/g, '');
  const [firstResult, ...rest] = media.filter(({node}) => node.source_url === sourceUrl);
  if (rest.length > 0) console.warn(`Multiple target images found for "${src}"`);
  return firstResult;
}

export function getImageWidth(sizes, width) {
  const sizesWidth = sizes == null ? null : sizes.split(', ')[1];
  return sizesWidth == null ? (width != null ? width + 'px' : '100%') : sizesWidth;
}

export function isCode(node) {
  return node.name != null && node.name === 'pre';
}

export function getCodeLanguage(node) {
  const {attribs: {class: nodeClass = ''} = {}} = node;
  const languageClass = nodeClass.split(' ').find(className => !codeClasses.includes(className));
  return languageClass != null && languageClass.startsWith('lang:') ? languageClass.split(':')[1] : languageClass;
}

export function getCode(node) {
  const {children: [firstChild] = []} = node;
  return firstChild != null && firstChild.name === 'code' ? firstChild.children : node.children;
}
