import { createMuiTheme } from "@material-ui/core";

import { lightBlue, teal } from "@material-ui/core/colors";

export const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: lightBlue,
    secondary: teal,
  },
  // status: {
  //   danger: 'orange',
  // },
});