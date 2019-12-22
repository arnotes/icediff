import * as monaco from 'monaco-editor';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  beforeFile?:string;
  afterFile?:string;
}

const DiffViewer: React.FC<Props> = (props) => {
  const divRef = useRef<HTMLDivElement>();
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor>();
  // eslint-disable-next-line
  const [height, setHeight] = useState(0);

  useEffect(()=>{
    if(!divRef.current){
      return;
    }
    console.log('create the editor');
    diffEditorRef.current = monaco.editor.createDiffEditor(divRef.current, {
      theme:'vs-dark',
    });
    return ()=>diffEditorRef?.current?.dispose();
  },[])

  useEffect(()=>{
    if(!diffEditorRef.current){
      return;
    }
    if(!props.beforeFile && !props.beforeFile){
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
      <div style={{height:height+400+'px'}} ref={divRef} className="my-editor"></div>
    </div>
  )
}

export default DiffViewer
