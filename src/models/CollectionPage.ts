export interface CollectionPage<T> {
  results: T[];
  page: number;
  totalPages: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

export function emptyPage<T>(): CollectionPage<T> {
  return {
    results: [],
    page: 1,
    totalPages: 1,
    pageSize: 1,
    first: true,
    last: true,
  };
}