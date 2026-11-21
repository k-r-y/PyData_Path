/// <reference types="vite/client" />

declare module 'virtual:problems-meta' {
  import type { ProblemMeta } from './types/problem';
  const problemsMeta: ProblemMeta[];
  export default problemsMeta;
}
