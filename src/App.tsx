import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import './App.css';
import ClippedDrawer from './components/ClippedDrawer';
import { theme } from './others/theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <ClippedDrawer/>
    </ThemeProvider>
  );
}

export default App;
