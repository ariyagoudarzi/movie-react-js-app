import { useState, useEffect } from "react";

export function useLocalStorage(initialState, key) {
  const [value, setValue] = useState(() => {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}
