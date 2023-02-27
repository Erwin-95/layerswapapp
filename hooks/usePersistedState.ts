import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { checkStorageIsAvailable, storageType } from '../helpers/storageAvailable';

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

function usePersistedState<T>(defaultValue: T, key: string, type: storageType = 'localStorage'): PersistedState<T> {
  const [value, setValue] = useState<T>(() => {
    const value = checkStorageIsAvailable(type) && window.localStorage.getItem(key);

    return value ? (JSON.parse(value || "null") as T) : defaultValue;
  });

  useEffect(() => {
    checkStorageIsAvailable(type) && window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export { usePersistedState };