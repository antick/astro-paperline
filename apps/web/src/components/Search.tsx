import Card, { type Props as CardProps } from '@components/Card';
import { UI } from '@config';
import Fuse from 'fuse.js';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

export type SearchItem = {
  title: string;
  description: string;
  data: CardProps['frontmatter'];
  slug: string;
};

interface Props {
  searchList: SearchItem[];
}

interface SearchResult {
  item: SearchItem;
  refIndex: number;
}

export default function SearchBar({ searchList }: Props) {
  const [{ inputVal, isReady }, setSearch] = useState({ inputVal: '', isReady: false });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setSearch({ inputVal: value, isReady: true });
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: ['title', 'description'],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.5
      }),
    [searchList]
  );

  useEffect(() => {
    // Restore the URL query before accepting input, so hydration cannot overwrite a reader's typing.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch({
      inputVal: new URLSearchParams(window.location.search).get('q') ?? '',
      isReady: true
    });
  }, []);

  const searchResults: SearchResult[] = useMemo(
    () => (inputVal.length > 1 ? fuse.search(inputVal) : []),
    [inputVal, fuse]
  );

  return (
    <>
      <label className="relative block">
        <span className="sr-only">Search</span>
        <span className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-75">
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-5 w-5">
            <path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z" />
          </svg>
        </span>
        <input
          className="block w-full rounded border border-skin-fill/40 bg-skin-fill py-3 pl-10 pr-3 placeholder:italic placeholder:text-skin-base/75 focus:border-skin-accent focus:outline-none"
          placeholder="Search for anything..."
          type="text"
          name="search"
          disabled={!isReady}
          value={inputVal}
          onChange={handleChange}
          autoComplete="off"
        />
      </label>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={inputVal.length > 1 ? 'mt-8' : 'sr-only'}
      >
        {inputVal.length > 1 ? (
          <>
            Found {searchResults?.length}{' '}
            {searchResults?.length && searchResults?.length === 1 ? ' result' : ' results'} for '
            {inputVal}'
          </>
        ) : (
          UI.searchPrompt
        )}
      </div>

      <ul>
        {searchResults?.map(({ item, refIndex }) => (
          <Card href={`/${item.slug}`} frontmatter={item.data} key={`${refIndex}-${item.slug}`} />
        ))}
      </ul>
    </>
  );
}
