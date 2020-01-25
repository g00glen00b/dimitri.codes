import React from 'react';
import './ActionTitle.css';
import {Button} from './Button';

export const ActionTitle = ({title, actionText, actionLink}) => (
  <div className="action-title">
    <h1 className="action-title__text">{title}</h1>
    {actionLink != null && actionText != null &&
      <Button
        isLink
        className="action-title__button"
        to={actionLink}>
        {actionText}
      </Button>
    }
  </div>
);
