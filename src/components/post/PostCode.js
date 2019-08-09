import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {github} from 'react-syntax-highlighter/dist/esm/styles/hljs';

export const PostCode = ({language, children}) => (
  <SyntaxHighlighter
    style={github}
    language={language}>
    {children}
  </SyntaxHighlighter>
);
