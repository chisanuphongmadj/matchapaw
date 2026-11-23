import { useEffect, useState } from "react";

/** หน่วงค่าไว้จนกว่าผู้ใช้จะหยุดพิมพ์ (ลดการยิง API ทุกตัวอักษร) */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
