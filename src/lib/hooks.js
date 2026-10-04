import { useEffect, useState } from 'react';
export function useNow(ms = 1000) {
  const [n, setN] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setN(new Date()), ms); return () => clearInterval(id); }, [ms]);
  return n;
}
