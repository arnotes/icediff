import { Divider, List, ListItem, ListItemText, TextField } from '@material-ui/core';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef } from 'react';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { useController } from '../hooks/useController';
import { useMergedState } from '../hooks/useMergedState';
import { ICommit } from '../models/commit.interface';
import { gitSvc } from '../services/git.service';

interface Props {
  
}

const commitsStyle:CSSProperties = {
  height: `calc(100vh - ${64 + 144}px)`,
  overflow: 'auto'
}

const CommitList: React.FC<Props> = () => {
  const subs = useRef(new Subscription());
  const sbjSearch = useRef(new Subject<string>());
  const [state, setState] = useMergedState({
    commits: [] as ICommit[],
    search: '',
    branch: '',
    branches: [] as string[]
  });

  const controller = useController({
    state,
    setState,
    subs
  });

  const loadCommits = useCallback(async (ignoreSkip = true) => {
      console.log('load commits'+ new Date().getTime());
      const result = await gitSvc.gitlog({
        subject:controller?.state?.search,
        skip:ignoreSkip? 0 : controller?.state?.commits?.length,
        branches: controller?.state?.branch
      });
      controller.setState(x => x.commits = ignoreSkip? [...result]:[...x.commits,...result]);
  },[controller]);

  useEffect(() => {
    gitSvc.gitBranch().then(result => controller.setState(x => {
      x.branch = result.currentBranch;
      x.branches = result.branches;
    }));
    const sub = sbjSearch.current.pipe(
        debounceTime(500)
      ).subscribe(strSearch=>{
        loadCommits();
      });
    return () => {
      sub.unsubscribe();
    };
  }, [controller,loadCommits]);

  useEffect(() => {
    sbjSearch.current.next(state.search);
  }, [sbjSearch,state.search,state.branch]);

  const commitElem = useMemo(() => (state.commits.map(x=>{
    return (
    <ListItem key={x.hash} button>
      <ListItemText 
        primary={<small>{x.subject}</small>}
        secondary={<small>{x.hash}</small>}
      />
    </ListItem>);
  })), [state.commits]);

  const branchesElem = useMemo(()=>{
    return state.branches.map(x=>(
      <option key={x} value={x}>
        {x}
      </option>      
    ))
  },[state.branches])

  return (
    <div className="CommitList">
      <List dense>
        <ListItem>
          <TextField fullWidth 
            value={state.search}
            onChange={e=>setState(x=>x.search=e.target.value)}
            type="search" 
            label="Search" 
            variant="outlined" />
        </ListItem>
        <ListItem>
          <TextField fullWidth 
            select
            value={state.branch}
            onChange={e=>setState(x=>x.branch=e.target.value)}
            SelectProps={{
              native: true,
            }}
            label="Branch" 
            variant="outlined">
            {branchesElem}
          </TextField>
        </ListItem>                
      </List>
      <Divider />
      <List style={commitsStyle} dense>
        {commitElem}
        <ListItem onClick={()=>loadCommits(false)} button>
          <ListItemText>Load More</ListItemText>
        </ListItem>
      </List>      
    </div>
  )
}

export default CommitList
