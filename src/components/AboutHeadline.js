import React from 'react';
import './AboutHeadline.css';

export const AboutHeadline = () => (
  <h1 className="about-headline">
    <small>
      <span role="img" aria-label="Hand waving emoji">👋</span>
      {` `}
      Hello, I&apos;m Dimitri<br/>
    </small>
    I love <strong>tinkering with code</strong>, and I occasionally <strong>write</strong> and <strong>talk</strong> about it.
  </h1>
);
