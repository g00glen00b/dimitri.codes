import React from 'react';
import parse, {domToReact} from 'html-react-parser';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {darcula} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {getCode, getCodeLanguage, getImageNode, isCode, isImage} from '../helpers/contentHelpers';
import {ContentImage} from './ContentImage';

function replace(node) {
  if (isImage(node)) {
    const imageNode = getImageNode(node);
    if (imageNode != null) {
      return <ContentImage
        src={imageNode.attribs.src}
        alt={imageNode.attribs.alt}
        width={imageNode.attribs.width}
        sizes={imageNode.attribs.sizes}/>
    }
  } else if (isCode(node)) {
    return <SyntaxHighlighter
      style={darcula}
      language={getCodeLanguage(node)}>
      {domToReact(getCode(node))}
    </SyntaxHighlighter>
  }
}

export const DangerousContent = ({content}) => <div>{parse(content, {replace})}</div>;
