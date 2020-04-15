import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { PlayingHand } from "./playingHand";
import { Mat } from "./mat";

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridGap: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(1),
  },
  playingCard: {
    float: 'left',
    minWidth: '75px',
  },
  table: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(1),
    minHeight: '800px',
    minWidth: '800px',
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
}));

function CardTable(props) {
  const [spacing, setSpacing] = React.useState(2);
  const classes = useStyles();

  const handleChange = (event) => {
    {console.log(props)}
    setSpacing(Number(event.target.value));
  }

  return (
      <Grid container spacing={3} style={{'maxWidth': '1200px'}}>
        <Grid item xs={1}/>
        <Grid item xs={10}>
          <Paper className={classes.paper}>xs=10</Paper>
        </Grid>
        <Grid item xs={1}/>
        <Grid item xs={1}>
          <Paper className={classes.paper}>xs=1</Paper>
        </Grid>
        <Grid item xs={10}>
          <Mat leftCard={"jh"} topCard={"js"} rightCard={"jc"} bottomCard={"jd"}/>
        </Grid>
        <Grid item xs={1}>
          <Paper className={classes.paper}>xs=1</Paper>
        </Grid>
        <Grid item xs={1}/>
        <Grid item xs={10} style={{textAlign: 'center'}}>
          <PlayingHand cards={['1h','kh', 'qh','jh','10h','9h','8h']}/>
        </Grid>
        <Grid item xs={1}/>
      </Grid>
  );
}

export { CardTable }
