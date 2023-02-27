import { useEffect, useState } from "react";
import { checkStorageIsAvailable, storageType } from "../helpers/storageAvailable";

type UseStorageReturnValue = {
  getItem: (key: string, type?: storageType) => string;
  setItem: (key: string, value: string, type?: storageType) => boolean;
  removeItem: (key: string, type?: storageType) => void;
  storageAvailable: boolean;
};

const useStorage = (): UseStorageReturnValue => {
  const getItem = (key: string, type?: storageType): string => {
    return checkStorageIsAvailable(type) ? window[type][key] : '';
  };

  const [storageAvailable, setStorageAvailable] = useState<boolean>();

  useEffect(() => {
    const storageSupported = checkStorageIsAvailable("localStorage")
    setStorageAvailable(storageSupported)
  }, []);

  const setItem = (key: string, value: string, type?: storageType): boolean => {
    if (checkStorageIsAvailable(type)) {
      window[type].setItem(key, value);
      return true;
    }

    return false;
  };

  const removeItem = (key: string, type?: storageType): void => {
    checkStorageIsAvailable(type) && window[type].removeItem(key);
  };

  return {
    getItem,
    setItem,
    removeItem,
    storageAvailable
  };
};

export default useStorage;