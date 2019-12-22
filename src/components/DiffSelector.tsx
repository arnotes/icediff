import { TextField } from '@material-ui/core';
import React, { ReactElement, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { useController } from '../hooks/useController';
import { gitSvc } from '../services/git.service';

interface Props{
  before?:string;
  after?:string;
  onChangeBeforeAfter?:(before:string,after:string)=>any;
  children?:any;
}

export default function DiffSelector(props:Props): ReactElement {
  const sbjChangeBeforeAfter = useRef(new Subject<string>());
  const [file, setFile] = useState('');
  const [fileOptions, setFileOptions] = useState([] as string[]);
  const onChangeText = props?.onChangeBeforeAfter;
  const handleFocus = useCallback((ev:React.FocusEvent<HTMLInputElement>)=>{
    ev.target.select();
  },[]);
  const cl = useController({
    before:props.before,
    after:props.after,
    setFile,
    setFileOptions
  })

  useEffect(()=>{
    sbjChangeBeforeAfter.current.next(props.before+props.after)
  },[sbjChangeBeforeAfter,props.before,props.after]);

  useEffect(()=>{
    const sub = sbjChangeBeforeAfter.current.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(async ()=>{
      const files = await gitSvc.gitdiffFiles(cl.before,cl.after);
      cl.setFile('');
      cl.setFileOptions(files);
    });
    return ()=>{
      sub.unsubscribe();
    }
  },[sbjChangeBeforeAfter,cl]);

  const fileOptionsElem = useMemo(()=>fileOptions.map(fileOption=>{
    return (
      <option key={fileOption}>{fileOption}</option>
    )
  }),[fileOptions])

  return (
    <div className="DiffSelector">
      <TextField 
        onFocus={handleFocus}
        value={props.before}
        onChange={e => onChangeText && onChangeText(e.target.value, props.after)}
        name="before"
        margin="dense"
        type="text" 
        label="Before" 
        variant="outlined" 
        color="secondary"
      />
      <TextField 
        onFocus={handleFocus}
        value={props.after}
        onChange={e => onChangeText && onChangeText(props.before, e.target.value)}
        name="after"
        margin="dense"
        type="text" 
        label="After" 
        color="secondary"
        variant="outlined" 
      />      
      <TextField 
        style={{width:'400px'}}
        select
        disabled={!fileOptions?.length}
        value={file}
        onChange={e=>setFile(e.target.value)}
        margin="dense"
        type="text" 
        label={!file? 'Select File':'File'}
        color="secondary"
        variant="outlined" 
        SelectProps={{
          native: true,
        }}        
      >
        <option value=''></option>
        {fileOptionsElem};
      </TextField>
    </div>
  )
}
