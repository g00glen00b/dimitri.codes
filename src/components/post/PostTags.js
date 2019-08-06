import React from 'react';
import styled from '@emotion/styled';
import {SimpleLink} from '../../theme';

const Tag = styled.span`
  text-transform: capitalize;
`;

export const PostTags = ({tags}) => (
  <span>
    {tags == null ? <Tag>none</Tag> : tags.map(({name, slug, id}, idx) => [
      idx > 0 && ', ',
      <Tag key={id}>
        <SimpleLink
          to={`/tag/${slug}`}
          title={`View all ${name} posts`}>
          {name}
        </SimpleLink>
      </Tag>
    ])}
  </span>
);
