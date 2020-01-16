import React from 'react';
import {Link} from 'gatsby';
import './ActionTitle.css';

export const ActionTitle = ({title, actionText, actionLink}) => (
  <div className="action-title">
    <h1 className="action-title__text">{title}</h1>
    {actionLink != null && actionText != null && <Link
      className="action-title__button"
      to={actionLink}>
      {actionText}
    </Link>}
  </div>
);
