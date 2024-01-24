
import { useAccessStore } from "../store";

export const getFetchPath = (path: string) => {
  const subPath = useAccessStore().subPath;
  return (
    subPath && subPath.length > 0 ? 
    ["/" + subPath, path].join("/") : 
    path
  )
};