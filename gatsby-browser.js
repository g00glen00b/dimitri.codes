import hljs from 'highlight.js/lib/highlight';
import 'highlight.js/styles/github.css';
import apache from 'highlight.js/lib/languages/apache';
import asciidoc from 'highlight.js/lib/languages/asciidoc';
import css from 'highlight.js/lib/languages/css';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import http from 'highlight.js/lib/languages/http';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import markdown from 'highlight.js/lib/languages/markdown';
import nginx from 'highlight.js/lib/languages/nginx';
import python from 'highlight.js/lib/languages/python';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('apache', apache);
hljs.registerLanguage('asciidoc', asciidoc);
hljs.registerLanguage('css', css);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('http', http);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('json', json);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('nginx', nginx);
hljs.registerLanguage('python', python);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

export const initializeHightlighting = () => {
  console.log(document.querySelectorAll('pre code').length);
  document
    .querySelectorAll('pre code')
    .forEach(block => hljs.highlightBlock(block));
  document
    .querySelectorAll('pre[class^=lang]')
    .forEach(block => hljs.highlightBlock(block));
  document
    .querySelectorAll('pre.prettyprint')
    .forEach(block => hljs.highlightBlock(block));
};

export const onRouteUpdate = initializeHightlighting;
export const onClientEntry = initializeHightlighting;
