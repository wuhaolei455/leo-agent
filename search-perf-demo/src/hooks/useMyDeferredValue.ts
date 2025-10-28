import { useEffect, useState, useTransition } from "react";

export const useMyDeferredValue = (value: any) => {
  const [newValue, setNewValue] = useState(value);
  const [___, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setNewValue(value);
    });
  }, [value, startTransition]);

  return newValue;
};
