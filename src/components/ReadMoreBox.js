import {Link} from 'gatsby';
import React from 'react';
import './ReadMoreBox.css';

export const ReadMoreBox = () => (
  <div className="read-more">
    <p className="read-more__info">
      Wait, there's more! I write new tutorials every other week, so feel free to check them out.
    </p>
    <Link to="/category/t">
      View all tutorials
    </Link>
  </div>
);
