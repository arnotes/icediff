import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import React, { useCallback } from 'react';
import { useController } from '../hooks/useController';
import { useMergedState } from '../hooks/useMergedState';
import { ICommit } from '../models/commit.interface';
import { theme } from '../others/theme';
import CommitList from './CommitList';
import DiffSelector from './DiffSelector';
import DiffViewer from './DiffViewer';


const drawerWidth = 300;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      overflow: 'hidden'
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    toolbar: theme.mixins.toolbar,
  }),
);

export default function ClippedDrawer() {
  const classes = useStyles(theme);
  const [state,setState] = useMergedState({
    before:'',
    after:'',
    beforeFile:'',
    afterFile:''
  });
  const cl = useController({
    state,
    setState
  });

  const handleClickCommit = useCallback((commit:ICommit)=>{
    cl.setState(x=>{
      x.before = commit.hash+'~1';
      x.after = commit.hash;
    })
  },[cl]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <DiffSelector
            onViewDiff={(beforeFile,afterFile)=>setState(x=>{
              x.beforeFile = beforeFile;
              x.afterFile = afterFile;
            })}
            onChangeBeforeAfter={(before,after)=>setState(x=>{
              x.before = before;
              x.after = after;
            })}
            before={state.before}
            after={state.after}
          >
          </DiffSelector>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.toolbar} />
        <CommitList onClickCommit={handleClickCommit}/>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} ></div>
        <DiffViewer beforeFile={state.beforeFile} afterFile={state.afterFile} ></DiffViewer>
      </main>
    </div>
  );
}