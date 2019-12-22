import * as monaco from 'monaco-editor';
import React, { useEffect, useRef } from 'react';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface Props {
  beforeFile?:string;
  afterFile?:string;
}

const editorStyle:React.CSSProperties = {
  height:`calc(100vh - ${115}px)`
}

const DiffViewer: React.FC<Props> = (props) => {
  const divRef = useRef<HTMLDivElement>();
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor>();

  useEffect(()=>{
    if(!divRef.current){
      return;
    }
    console.log('create the editor');
    diffEditorRef.current = monaco.editor.createDiffEditor(divRef.current, {
      theme:'vs-dark',
    });
    const resizeSub = fromEvent(window,'resize')
                      .pipe(debounceTime(500))
                      .subscribe(()=>diffEditorRef?.current?.layout());
    return ()=>{
      diffEditorRef?.current?.dispose();
      resizeSub.unsubscribe();
    };
  },[])

  useEffect(()=>{
    if(!diffEditorRef.current){
      return;
    }
    if(!props.beforeFile && !props.afterFile){
      return;
    }

    var original = monaco.editor.createModel(props.beforeFile ?? '');
    var modified = monaco.editor.createModel(props.afterFile ?? '');    
    diffEditorRef.current.setModel({
      original,
      modified
    });
  },[props.beforeFile,props.afterFile]);

  return (
    <div className="DiffViewer">
      <div style={editorStyle} ref={divRef} className="my-editor"></div>
    </div>
  )
}

export default DiffViewer
