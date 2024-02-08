
export const getFetchUrl = (subPath: string, path: string) => (
  subPath.length > 0 ? subPath + path : path
);

