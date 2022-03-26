import React from 'react';
import {useEffect, useRef} from 'react';
import {graphql, useStaticQuery} from 'gatsby';

const siteMetadataQuery = graphql`
  query {
    site {
      siteMetadata {
        utterances {
          repoUrl
          theme
          issueTerm
          label
        }
      }
    }
  }
`;

export const Comments = () => {
  const {site: {siteMetadata: {utterances}}} = useStaticQuery(siteMetadataQuery);
  const container = useRef(null);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', utterances.repoUrl);
    script.setAttribute('issue-term', utterances.issueTerm);
    script.setAttribute('theme', utterances.theme);
    script.setAttribute('label', utterances.label)
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    container.current.appendChild(script);

    return () => container.innerHTML = '';
  }, [utterances.issueTerm, utterances.label, utterances.repoUrl, utterances.theme]);

  return (
    <div ref={container} />
  );
};
