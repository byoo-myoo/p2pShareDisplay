/// <reference types="vite/client" />

declare const __LOCAL_IP__: string | undefined;

declare module '*.md?raw' {
  const content: string;
  export default content;
}
