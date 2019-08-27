import styled from '@emotion/styled';
import {PostTags} from './PostTags';
import React from 'react';

const PostMetaSmall = styled.small`
  opacity: 0.8;
`;

export const PostMeta = ({date, readingTime, tags}) => (
  <PostMetaSmall>
    {date}
    {` | `}
    {readingTime.text}
    {` | `}
    <PostTags tags={tags}/>
  </PostMetaSmall>
);
