import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import PlayingCard from "./PlayingCard/Hand/PlayingCard/PlayingCard";

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
    backgroundColor: 'green',
  },
  table: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(1),
    minHeight: '160px',
  },
  horizontalHand: {
    minHeight: '100px',
  },
  verticalHand: {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '160px',
  },
}));

function Mat(props) {
  const [setSpacing] = React.useState(2);
  const classes = useStyles();

  return (
      <Paper className={classes.paper}>
        <Grid container spacing={3}>
          <Grid item xs={3}/>
          <Grid item xs={6}>
            <div className={classes.horizontalHand}>
            {props.cards.topCard &&
            <PlayingCard card={props.cards.topCard} height={100} onClick={() => {}}/>
            }
            </div>
          </Grid>
          <Grid item xs={3}/>
          <Grid item xs={3}>
            <div className={classes.verticalHand}>
              {props.cards.leftCard &&
              <PlayingCard card={props.cards.leftCard} height={100} onClick={() => {}}/>
              }
            </div>
          </Grid>
          <Grid item xs={6}>

          </Grid>
          <Grid item xs={3}>
            <div className={classes.verticalHand}>
              {props.cards.rightCard &&
              <PlayingCard card={props.cards.rightCard} height={100} onClick={() => {}}/>
              }
            </div>
          </Grid>
          <Grid item xs={3}/>
          <Grid item xs={6}>
            <div className={classes.horizontalHand}>
            {props.cards.bottomCard &&
            <PlayingCard card={props.cards.bottomCard} height={100} onClick={() => {}}/>
            }
            </div>
          </Grid>
          <Grid item xs={3}/>
        </Grid>
      </Paper>
  );
}

export { Mat }
