import { useRef, useState, useEffect } from "react";
import { BehaviorSubject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useController } from "./useController";

export function useDebouncedValue<V,G>(val:V, generate:(value:V) => G){
  const sbj = useRef(new BehaviorSubject(val));
  const [gen, setGen] = useState<G>();
  const ctl = useController({generate});

  useEffect(()=>{
    const sub = sbj.current.pipe(debounceTime(500))
                  .subscribe(value => setGen(ctl.generate(value)));
    return ()=>sub.unsubscribe();
  },[ctl]);

  useEffect(()=>{
    sbj.current.next(val);
  },[val]);

  return gen;
}