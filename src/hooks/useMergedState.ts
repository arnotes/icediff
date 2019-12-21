import { useState, useCallback } from "react";
export type setterCallback<T> = (state:T)=>any;
export type setterAction<T> = (callback:setterCallback<T>)=>void;

export function useMergedState<T>(initialState:T):[T,setterAction<T>]{
  const [state, setState] = useState(initialState);
  const action = useCallback((callback:setterCallback<T>)=>{
    const shallowCopy = {...state};
    callback(shallowCopy);
    setState(shallowCopy);
  },[state]);
  return [state,action];
}