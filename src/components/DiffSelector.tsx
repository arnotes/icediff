import { TextField } from '@material-ui/core';
import React, { ReactElement, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { useController } from '../hooks/useController';
import { gitSvc } from '../services/git.service';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface Props{
  after?:string;
  before?:string;
  children?:any;
  onChangeBeforeAfter?:(before:string,after:string)=>any;
  onViewDiff?:(before:string,after:string)=>any;
}

export default function DiffSelector(props:Props): ReactElement {
  const sbjChangeBeforeAfter = useRef(new Subject<string>());
  const [file, setFile] = useState('');
  const [fileOptions, setFileOptions] = useState([] as string[]);
  const [filter, setFilter] = useState('');
  const reg = useDebouncedValue(filter, x => x? new RegExp(x,'i') : undefined);
  const onChangeText = props?.onChangeBeforeAfter;
  const handleFocus = useCallback((ev:React.FocusEvent<HTMLInputElement>)=>{
    ev.target.select();
  },[]);
  const cl = useController({
    onViewDiff:props.onViewDiff,
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

  const fileOptionsElem = useMemo(()=>fileOptions.filter(fileOption => !reg || fileOption.match(reg)).map(fileOption=>{
    return (
      <option key={fileOption}>{fileOption}</option>
    )
  }),[fileOptions, reg])

  const handleFileSelect = useCallback(async (ev:React.ChangeEvent<HTMLInputElement>)=>{
    console.log('handleFileSelect');
    cl.setFile(ev.target.value);
    const {beforeFile,afterFile} = await gitSvc.gitdiffSideBySide(cl.before,cl.after,ev.target.value);
    cl.onViewDiff && cl.onViewDiff(beforeFile,afterFile);
  },[cl]);

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
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <TextField 
        onFocus={handleFocus}
        value={filter}
        onChange={e => setFilter(e.target.value)}
        name="after"
        margin="dense"
        type="text" 
        label="Filter" 
        color="secondary"
        variant="outlined" 
      />      
      <TextField 
        style={{width:'400px'}}
        select
        disabled={!fileOptions?.length}
        value={file}
        onChange={handleFileSelect}
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
