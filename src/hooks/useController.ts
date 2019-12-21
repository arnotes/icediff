import { useRef } from "react";

export function useController<T>(obj:T){
  const ref = useRef(obj);
  Object.assign(ref.current,obj);
  return ref.current;
}