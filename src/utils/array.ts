import type {CollectionPage} from '../models/CollectionPage.ts';
import type {Group} from '../models/Group.ts';

export function compareByProperty<S, T>(mapper: (obj: S) => T): (obj1: S, obj2: S) => number {
  return (obj1, obj2) => {
    const property1 = mapper(obj1);
    const property2 = mapper(obj2);
    if (property1 < property2) return -1;
    if (property1 > property2) return 1;
    return 0;
  };
}

export function groupByArrayProperty<R, G>(arr: R[], mapper: (obj: R) => G[]): Group<G, R>[] {
  const map = new Map<string, R[]>();
  const allResults: Group<G, R>[] = [];
  arr.forEach(element => {
    const groups = mapper(element);
    groups.forEach(group => {
      const groupString = JSON.stringify(group);
      const collection = map.get(groupString);
      if (collection == null) map.set(groupString, [element]);
      else collection.push(element);
    });
  });
  map.forEach((results, groupString) => {
    const group: G = JSON.parse(groupString);
    allResults.push({group, results})
  });
  return allResults;
}

export function sliceIntoPages<R>(arr: R[], pageSize: number): CollectionPage<R>[] {
  const results = new Map<number, CollectionPage<R>>;
  const totalPages = Math.ceil(arr.length / pageSize);
  arr.forEach((element, index) => {
    const page = Math.floor(index / pageSize) + 1;
    const collectionPage = results.get(page);
    if (collectionPage == null) {
      const first = page === 1;
      const last = page === totalPages;
      results.set(page, {results: [element], pageSize, page, totalPages, first, last});
    } else {
      collectionPage.results.push(element);
    }
  });
  return [...results.values()];
}