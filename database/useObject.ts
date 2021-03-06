import { database, FirebaseError } from 'firebase';
import { useEffect } from 'react';
import { snapshotToData } from './helpers';
import { LoadingHook, useIsEqualRef, useLoadingValue } from '../util';

export type ObjectHook = LoadingHook<database.DataSnapshot, FirebaseError>;
export type ObjectValHook<T> = LoadingHook<T, FirebaseError>;

export const useObject = (query?: database.Query | null): ObjectHook => {
  const { error, loading, reset, setError, setValue, value } = useLoadingValue<
    database.DataSnapshot,
    FirebaseError
  >();
  const ref = useIsEqualRef(query, reset);

  useEffect(
    () => {
      const query = ref.current;
      if (!query) {
        setValue(undefined);
        return;
      }

      query.on('value', setValue, setError);

      return () => {
        query.off('value', setValue);
      };
    },
    [ref.current]
  );

  return [value, loading, error];
};

export const useObjectVal = <T>(
  query?: database.Query | null,
  options?: {
    keyField?: string;
  }
): ObjectValHook<T> => {
  const [value, loading, error] = useObject(query);
  return [
    value
      ? snapshotToData(value, options ? options.keyField : undefined)
      : undefined,
    loading,
    error,
  ];
};
