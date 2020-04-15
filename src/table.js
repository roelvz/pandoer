import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { PlayingHand } from "./playingHand";
import {cardsToCid, cardToCid} from './cardUtils';
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
  verticalHand: {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '424px',
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
}));

function getPlayers(props) {
  let result = [];
  let playerId = props.myPlayerId;
  for (let i = 0; i < 4; i++) {
    result.push(props.G.playersKnownInfo[playerId]);
    playerId++;
    playerId %= 4;
  }
  return result;
}

function getTableCards(props) {
  let playerId = props.myPlayerId;
  let result = {
    leftCard: undefined,
    rightCard: undefined,
    bottomCard: undefined,
    topCard: undefined,
  }

  if (props.G.playersKnownInfo[playerId].hasPlayedCard) {
    result.bottomCard = cardToCid(props.G.playersKnownInfo[playerId].lastPlayedCard);
  }
  playerId++;
  playerId %= 4;

  if (props.G.playersKnownInfo[playerId].hasPlayedCard) {
    result.leftCard = cardToCid(props.G.playersKnownInfo[playerId].lastPlayedCard);
  }
  playerId++;
  playerId %= 4;

  if (props.G.playersKnownInfo[playerId].hasPlayedCard) {
    result.topCard = cardToCid(props.G.playersKnownInfo[playerId].lastPlayedCard);
  }
  playerId++;
  playerId %= 4;

  if (props.G.playersKnownInfo[playerId].hasPlayedCard) {
    result.rightCard = cardToCid(props.G.playersKnownInfo[playerId].lastPlayedCard);
  }

  return result;
};

function CardTable(props) {
  const [spacing, setSpacing] = React.useState(2);
  const classes = useStyles();

  const handleChange = (event) => {
    setSpacing(Number(event.target.value));
  }

  return (
      <Grid container spacing={3} >
        <Grid item xs={1}/>
        <Grid item xs={10}>
          <Paper className={classes.paper}>{getPlayers(props)[2].name}</Paper>
        </Grid>
        <Grid item xs={1}/>
        <Grid item xs={1}>
          <Paper className={classes.verticalHand}>{getPlayers(props)[1].name}</Paper>
        </Grid>
        <Grid item xs={10}>
          <Mat cards={getTableCards(props)}/>
        </Grid>
        <Grid item xs={1}>
          <Paper className={classes.verticalHand}>{getPlayers(props)[3].name}</Paper>
        </Grid>
        <Grid item xs={1}/>
        <Grid item xs={10} style={{textAlign: 'center'}}>
          <Paper className={classes.paper}>
            <h1>{props.action}</h1>
            <PlayingHand cards={cardsToCid(props.G.players[props.myPlayerId].hand)}/>
          </Paper>
        </Grid>
        <Grid item xs={1}/>
      </Grid>
  );
}

export { CardTable }
