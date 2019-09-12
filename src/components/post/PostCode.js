import React from 'react';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {darcula} from 'react-syntax-highlighter/dist/esm/styles/prism';

export const PostCode = ({language, children}) => (
  <SyntaxHighlighter
    style={darcula}
    language={language}>
    {children}
  </SyntaxHighlighter>
);
