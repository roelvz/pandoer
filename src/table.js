import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { PlayingHand } from "./playingHand";
import {cardsToCid, cardToCid, cidToCard} from './cardUtils';
import { Mat } from "./mat";

import {
  canShout,
  shouldAnnounce,
  shouldShout,
  someoneShoutedPandoer,
  someoneShoutedPandoerOnTable
} from "./pandoerRules";

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
  let shoutValue = 0

  const [spacing, setSpacing] = React.useState(2);
  const classes = useStyles();

  const handleChange = (event) => {
    setSpacing(Number(event.target.value));
  }

  function play(key) {
    console.log('clicked on card in hand: ' + key);
    console.log(props);
    if (shouldAnnounce(props.G, props.ctx, props.ctx.currentPlayer)) {
      props.moves.addCardToAnnouncement(cidToCard(key));
    } else {
      props.moves.playCard(cidToCard(key));
    }
  }

  function shout() {
    props.moves.shout(shoutValue);
  }

  function pass() {
    props.moves.pass();
  }

  function pandoer() {
    props.moves.pandoer();
  }

  function pandoerOnTable() {
    props.moves.pandoerOnTable();
  }

  function getPlayerStyle(playerId, props) {
    // console.log(playerId)
    // if (playerId === props.ctx.currentPlayer) {
    //   return {
    //     color: 'blue',
    //     fontWeight: 700,
    //   }
    // }
  }

  function getPlayerShoutString(player) {
    let str = '';
    if (player.shoutedPandoerOnTable) {
      str = 'Pandoer op tafel!'
    } else if (player.shoutedPandoer) {
      str = 'Pandoer!'
    } else  {
      str = player.shout || (player.passed ? 'pas' : 'niet geroepen')
    }

    return <div>Roep: {str}</div>
  }

  function handleShoutChange(event) {
    shoutValue = parseInt(event.target.value)
    // this.setState({shoutValue: parseInt(event.target.value)});
  }

  function getAnnouncementForm(props) {
    if (shouldShout(props.G, props.ctx, props.myPlayerId)) {
      return <div>
        <TextField onChange={handleShoutChange}/>
        <Button variant="contained" disabled={!canShout(props.G, props.ctx, shoutValue)} onClick={shout}>Roepen</Button>
        <Button variant="contained" onClick={pass}>Pas</Button>
        <Button variant="contained" disabled={someoneShoutedPandoer(props.G)} onClick={pandoer}>Pandoer kletsen</Button>
        <Button variant="contained" disabled={someoneShoutedPandoerOnTable(props.G)} onClick={pandoerOnTable}>Pandoer op tafel</Button>
      </div>
    }
  }

  function getUpperPlayer(props) {
    let result = 0;
    switch (props.myPlayerId) {
      case '0': result = '3';
      case '1': result = '0';
      case '2': result = '1';
      case '3': result = '2';
    }
    console.log(result)
    return result
  }

  function getUpperPlayerId(props) {
    let result = 0;
    switch (props.myPlayerId) {
      case '0': result = '2';
      case '1': result = '3';
      case '2': result = '0';
      case '3': result = '1';
    }
    return result
  }

  function getLeftPlayer(props) {
    let result = 0;
    switch (props.myPlayerId) {
      case '0': result =  '2';
      case '1': result =  '3';
      case '2': result =  '0';
      case '3': result =  '1';
    }
    return result
  }

  function getLeftPlayerId(props) {
    let result = 0;
    switch (props.myPlayerId) {
      case '0': result =  '1';
      case '1': result =  '2';
      case '2': result =  '3';
      case '3': result =  '0';
    }
    return result
  }

  function getRightPlayer(props) {
    let result = 0;
    switch (props.myPlayerId) {
      case '0': result = '0';
      case '1': result = '1';
      case '2': result = '2';
      case '3': result = '3';
    }
    return result
  }

  function getRightPlayerId(props) {
    let result = 0;
    switch (props.myPlayerId) {
      case '0': result = '3';
      case '1': result = '2';
      case '2': result = '1';
      case '3': result = '0';
    }
    return result
  }

  return (
      <Grid container spacing={3} >
        <Grid item xs={2}/>
        <Grid item xs={8} style={{textAlign: 'center'}}>
          <Paper className={classes.paper}>
            <div style={getPlayerStyle(getUpperPlayerId(props), props)}>
              <div>{(getPlayers(props)[getUpperPlayer(props)]).name}</div>
              {getPlayerShoutString(getPlayers(props)[getUpperPlayer(props)])}
            </div>
          </Paper>
        </Grid>
        <Grid item xs={2}/>
        <Grid item xs={2} style={{textAlign: 'center'}}>
          <Paper className={classes.verticalHand}>
            <div style={getPlayerStyle(getLeftPlayerId(props), props)}>
              <div>{getPlayers(props)[getLeftPlayer(props)].name}</div>
              {getPlayerShoutString(getPlayers(props)[getLeftPlayer(props)])}
            </div>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Mat cards={getTableCards(props)}/>
        </Grid>
        <Grid item xs={2} style={{textAlign: 'center'}}>
          <Paper className={classes.verticalHand}>
            <div style={getPlayerStyle(getRightPlayerId(props), props)}>
              <div>{getPlayers(props)[getRightPlayer(props)].name}</div>
              {getPlayerShoutString(getPlayers(props)[getRightPlayer(props)])}
            </div>
          </Paper>
        </Grid>
        <Grid item xs={1}/>
        <Grid item xs={10} style={{textAlign: 'center'}}>
          <Paper className={classes.paper}>
            <h1>{props.action}</h1>
            <PlayingHand cards={cardsToCid(props.G.players[props.myPlayerId].hand)} onClick={play}/>
          </Paper>
        </Grid>
        <Grid item xs={1}/>
      </Grid>
  );
}

export { CardTable }
