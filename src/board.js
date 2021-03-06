import React from 'react';
import Paper from '@material-ui/core/Paper';
import { CardTable } from './table'
import { PlayingHand } from "./playingHand";
import { cidToCard, cardToCid, cardsToCid, suitInDutch } from './cardUtils';
import {
  shouldAnnounce,
  getPlayerId,
  getTeamMatePlayerId,
  shouldShout,
  canShout,
  someoneShoutedPandoer,
  someoneShoutedPandoerOnTable,
} from './pandoerRules';
import Hand from "./PlayingCard/Hand/Hand";
import PlayingCard from "./PlayingCard/Hand/PlayingCard/PlayingCard";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core/styles";

const classes = makeStyles((theme) => ({
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

// TODO: highlight highest card
// TODO: show owner of card
class PandoerBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layout: "spread",
      shoutValue: 0,
    };

    this.handleChange = this.handleChange.bind(this);
    this.play = this.play.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.shout = this.shout.bind(this);
    this.pass = this.pass.bind(this);
    this.pandoer = this.pandoer.bind(this);
    this.pandoerOnTable = this.pandoerOnTable.bind(this);
    this.getId = this.getId.bind(this);
    this.announce = this.announce.bind(this);
    this.acceptResult = this.acceptResult.bind(this);
    this.resign = this.resign.bind(this);
    this.resetGame = this.resetGame.bind(this);
  }

  getCardSize(cards) {
    let cardSize = window.innerWidth / cards.length;
    return this.state.layout !== "spread" || cardSize > 100 ? 100 : cardSize;
  }

  handleChange(event) {
    this.setState({shoutValue: parseInt(event.target.value)});
  }


  shout(event) {
    this.props.moves.shout(this.state.shoutValue);
  }

  pass(event) {
    this.props.moves.pass();
  }

  pandoer(event) {
    this.props.moves.pandoer();
  }

  pandoerOnTable(event) {
    this.props.moves.pandoerOnTable();
  }

  announce() {
    this.props.moves.announce();
  }

  acceptResult() {
    this.props.moves.acceptResult(this.getId());
  }

  resign() {
    this.props.moves.resign();
  }

  resetGame() {
    this.props.moves.resetGame();
  }

  play(key) {
    console.log('clicked on card in hand: ' + key);
    if (shouldAnnounce(this.props.G, this.props.ctx, this.props.ctx.currentPlayer)) {
      this.props.moves.addCardToAnnouncement(cidToCard(key));
    } else {
      this.props.moves.playCard(cidToCard(key));
    }
  }

  removeCard(key) {
    this.props.moves.removeCardFromAnnouncement(cidToCard(key));
  }

  getId() {
    return getPlayerId(this.props.G, this.props.ctx);
  }

  render() {
    const handStyle = {
      margin: "auto",
      width: "60%",
    };

    function showLastPlayedCard(that, card) {
      if (card !== undefined) {
        return <PlayingCard card={cardToCid(card)} height={100} onClick={that.play}/>
      }
    }

    function getActionText(that) {
      if (that.props.ctx.phase === 'countPoints') {
        return "Allemaal accepteren om opnieuw te delen"
      }

      if (that.props.ctx.currentPlayer === that.getId()) {
        if (that.props.ctx.phase === 'shouts') {
          return "Uw beurt, roepen of passen"
        } else if (shouldAnnounce(that.props.G, that.props.ctx, that.props.ctx.currentPlayer)) {
          return "Uw beurt, kies kaarten om te tonen en toon"
        } else {
          return "Uw beurt, speel een kaart"
        }
      } else {
        if (that.props.ctx.phase === 'shouts') {
          return `${that.props.G.playersKnownInfo[that.props.ctx.currentPlayer].name} is aan de beurt om te roepen of te passen`
        } else if(shouldAnnounce(that.props.G, that.props.ctx, that.props.ctx.currentPlayer)) {
          return `${that.props.G.playersKnownInfo[that.props.ctx.currentPlayer].name} is aan de beurt om te tonen`
        } else {
          return `${that.props.G.playersKnownInfo[that.props.ctx.currentPlayer].name} is aan de beurt om een kaart te spelen`
        }
      }
    }

    function getAction(that) {
      return <h1>{getActionText(that)}</h1>
    }

    function getAnnouncementForm(that) {
      if (shouldShout(that.props.G, that.props.ctx, that.getId())) {
        return <div>
          <input onChange={that.handleChange}/>
          <button disabled={!canShout(that.props.G, that.props.ctx, that.state.shoutValue)} onClick={that.shout}>Roepen</button>
          <button onClick={that.pass}>Pas</button>
          <button disabled={someoneShoutedPandoer(that.props.G)} onClick={that.pandoer}>Pandoer kletsen</button>
          <button disabled={someoneShoutedPandoerOnTable(that.props.G)} onClick={that.pandoerOnTable}>Pandoer op tafel</button>
        </div>
      }
    }

    function getAnnouncement(that) {
      if (!someoneShoutedPandoer(that.props.G) && !(someoneShoutedPandoerOnTable(that.props.G))) {
        let playerId;
        let button;
        const thisPlayerShouldAnnounce = shouldAnnounce(that.props.G, that.props.ctx, that.getId());
        if (thisPlayerShouldAnnounce) {
          playerId = that.getId();
          button = <button onClick={that.announce}>Tonen</button>
        } else if (that.props.G.lastAnnouncingPlayer && that.props.G.playersKnownInfo[that.props.G.lastAnnouncingPlayer].hasAnnounced) {
          playerId = that.props.G.lastAnnouncingPlayer;
        } else {
          return;
        }
        let otherPlayerId = getTeamMatePlayerId(playerId);
        let otherPlayerHand;
        let score = that.props.G.playersKnownInfo[playerId].announcementScore;
        let scoreString = score.toString();
        if (that.props.G.playersKnownInfo[otherPlayerId].hasAnnounced) {
          otherPlayerHand = <Hand hide={false}
                                  layout={that.state.layout}
                                  cards={cardsToCid(that.props.G.playersKnownInfo[otherPlayerId].announcement)}
                                  cardSize={that.getCardSize(cardsToCid(that.props.G.playersKnownInfo[otherPlayerId].announcement))}
                                  onClick={() => {
                                  }}/>;
          let otherScore = that.props.G.playersKnownInfo[otherPlayerId].announcementScore;
          score += otherScore;
          scoreString += ` + ${otherScore} = ${score}`;
        }
        return <div style={handStyle}>
          Toon:
          <Hand hide={false}
                layout={that.state.layout}
                cards={cardsToCid(that.props.G.playersKnownInfo[playerId].announcement)}
                cardSize={that.getCardSize(cardsToCid(that.props.G.playersKnownInfo[playerId].announcement))}
                onClick={that.removeCard}/>
          {otherPlayerHand}
          <br/>
          Score: {scoreString}{button}
        </div>
      }
    }

    function getCountPhaseInfo(that) {
      if (that.props.ctx.phase === 'countPoints') {
        let result;

        let info1;
        let info2;

        if (someoneShoutedPandoer(that.props.G) || someoneShoutedPandoerOnTable(that.props.G)) {
          const playerName = that.props.G.playersKnownInfo[that.props.G.highestShoutingPlayer].name;
          if (that.props.G.pandoerLost) {
            info1 = playerName + ' heeft Pandoer' + (someoneShoutedPandoerOnTable(that.props.G) ? ' op tafel' : '') + ' verloren';
          } else {
            info1 = playerName + ' heeft Pandoer' + (someoneShoutedPandoerOnTable(that.props.G) ? ' op tafel' : '') + ' gewonnen';
          }
          result = <div>
            {info1}:
            <div style={handStyle}>
              <Hand hide={false} layout={"fan"}
                    cards={cardsToCid(that.props.G.tricks[0].flat())}
                    cardSize={that.getCardSize(cardsToCid(that.props.G.tricks[0].flat()))}
                    onClick={() => {
                    }}></Hand>
            </div>
            <div style={handStyle}>
              <Hand hide={false} layout={"fan"}
                    cards={cardsToCid(that.props.G.tricks[1].flat())}
                    cardSize={that.getCardSize(cardsToCid(that.props.G.tricks[1].flat()))}
                    onClick={() => {
                    }}></Hand>
            </div>
          </div>
        } else {
          let winner;
          if (that.props.G.attackingTeam === 0) {
            let shoutScore = that.props.G.playersKnownInfo[0].passed ? that.props.G.playersKnownInfo[2].shout : that.props.G.playersKnownInfo[0].shout;
            let announcementScore = that.props.G.playersKnownInfo[0].announcementScore + that.props.G.playersKnownInfo[2].announcementScore;
            info1 = 'Team 1 heeft ' + shoutScore + ' geroepen, heeft ' + announcementScore + ' getoond en haalde ' + (that.props.G.roundScore[0] - announcementScore) + ' punten';
            info2 = 'Team 2 haalde ' + that.props.G.roundScore[1] + ' punten';
            if (that.props.G.roundScore[0] >= shoutScore - announcementScore) {
              info2 += ` (${(that.props.G.roundScore[0] - announcementScore)} >= ${shoutScore - announcementScore})`
            } else {
              info2 += ` (${(that.props.G.roundScore[0] - announcementScore)} < ${shoutScore - announcementScore})`
            }
            if (that.props.G.roundScore[0] >= shoutScore - announcementScore) {
              winner = <h1>Team 1 is gewonnen</h1>
            } else {
              winner = <h1>Team 2 is gewonnen</h1>
            }
          } else {
            let shoutScore = that.props.G.playersKnownInfo[1].passed ? that.props.G.playersKnownInfo[3].shout : that.props.G.playersKnownInfo[1].shout;
            let announcementScore = that.props.G.playersKnownInfo[1].announcementScore + that.props.G.playersKnownInfo[3].announcementScore;
            info1 = 'Team 1 haalde ' + that.props.G.roundScore[0] + ' punten';
            info2 = 'Team 2 heeft ' + shoutScore + ' geroepen, heeft ' + announcementScore + ' getoond en haalde ' + (that.props.G.roundScore[1] - announcementScore) + ' punten';
            if (that.props.G.roundScore[1] >= shoutScore - announcementScore) {
              info2 += ` (${(that.props.G.roundScore[1] - announcementScore)} >= ${shoutScore - announcementScore})`
            } else {
              info2 += ` (${(that.props.G.roundScore[1] - announcementScore)} < ${shoutScore - announcementScore})`
            }
            if (that.props.G.roundScore[1] >= shoutScore - announcementScore) {
              winner = <h1>Team 2 is gewonnen</h1>
            } else {
              winner = <h1>Team 1 is gewonnen</h1>
            }
          }

          result = <div>
            {winner}
            {info1}:
            <div style={handStyle}>
              <Hand hide={false} layout={"fan"}
                    cards={cardsToCid(that.props.G.tricks[0].flat())}
                    cardSize={that.getCardSize(cardsToCid(that.props.G.tricks[0].flat()))}
                    onClick={() => {
                    }}></Hand>
            </div>
            {info2}
            <div style={handStyle}>
              <Hand hide={false} layout={"fan"}
                    cards={cardsToCid(that.props.G.tricks[1].flat())}
                    cardSize={that.getCardSize(cardsToCid(that.props.G.tricks[1].flat()))}
                    onClick={() => {
                    }}></Hand>
            </div>
          </div>
        }

        return <div>
          {result}
          <div>
            <button onClick={that.acceptResult}>Ok, verder spelen</button>
          </div>
          <div>
            {that.props.G.playersKnownInfo[0].name}: {that.props.G.playersKnownInfo[0].hasAcceptedResult ? 'geaccepteerd' : 'moet nog accepteren'}<br/>
            {that.props.G.playersKnownInfo[1].name}: {that.props.G.playersKnownInfo[1].hasAcceptedResult ? 'geaccepteerd' : 'moet nog accepteren'}<br/>
            {that.props.G.playersKnownInfo[2].name}: {that.props.G.playersKnownInfo[2].hasAcceptedResult ? 'geaccepteerd' : 'moet nog accepteren'}<br/>
            {that.props.G.playersKnownInfo[3].name}: {that.props.G.playersKnownInfo[3].hasAcceptedResult ? 'geaccepteerd' : 'moet nog accepteren'}<br/>
          </div>
        </div>
      }
    }

    function getLastTrick(that) {
      if (that.props.G.table.length === 0) {
        return <h2>
          Vorige slag:
          <PlayingHand cards={cardsToCid(that.props.G.lastTrick)}/>
        </h2>
      }
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

      return <div>
        {player.name}: {str}<br/>
      </div>
    }

    function getNumberOfTricks(that) {
      if (!someoneShoutedPandoer(that.props.G) && !someoneShoutedPandoerOnTable(that.props.G)) {
        return <div>
          Team 1: Aantal slagen: {that.props.G.tricks[0].length} {that.props.G.attackingTeam === undefined ? '' : (that.props.G.attackingTeam === 0 ? '(de goei)' : '(de slechte)')}<br/>
          Team 2: Aantal slagen: {that.props.G.tricks[1].length} {that.props.G.attackingTeam === undefined ? '' : (that.props.G.attackingTeam === 1 ? '(de goei)' : '(de slechte)')}<br/><br/>
        </div>
      }
    }

    function getMain(that) {
      if (that.props.ctx.phase === 'countPoints') {
        return getCountPhaseInfo(that);
      } else {
        return <div>Speler aan beurt: {that.props.G.playersKnownInfo[that.props.ctx.currentPlayer.toString()].name}<br/><br/>
          {getAnnouncementForm(that)}
          Geroepen:<br/><br/>

          {getNumberOfTricks(that)}

          <div>
            Uw laatst gespeelde kaart: {showLastPlayedCard(that, that.props.G.playersKnownInfo[that.getId()].lastPlayedCard)}
            {getAnnouncement(that)}
            <br/>
            <button onClick={that.resign}>Opgeven</button><br/><br/>

            <button onClick={that.resetGame}>Spel volledig herstarten</button>
          </div>
        </div>
      }
    }

    return (
        <div>
          <Grid container container spacing={3} style={{'maxWidth': '1900px'}}>
            <Grid item xs={1}>
              <Paper className={classes.paper} style={{textAlign: 'center'}}>
                <h2>Boom</h2>
                <h3>Team 1: {this.props.G.scoreBoard[0]}</h3>
                <h3>Team 2: {this.props.G.scoreBoard[1]}</h3>
              </Paper>
            </Grid>
            <Grid item xs={8}>
              <div>
                <CardTable G={this.props.G}
                           ctx={this.props.ctx}
                           moves={this.props.moves}
                           myPlayerId={this.getId()}
                           action={getActionText(this)}
                           shoutValue={this.state.shoutValue}/>
              </div>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper} style={{textAlign: 'center'}}>
                <h1>Troef: {suitInDutch(this.props.G.trump)}</h1>
                {getLastTrick(this)}
              </Paper>
            </Grid>
          </Grid>

          Fase: { this.props.ctx.phase === 'shouts' ? 'roepen' : (this.props.ctx.phase === 'play' ? 'spelen' : 'punten tellen')}<br/>

          {getMain(this)}
        </div>
    )
  }
}

export { PandoerBoard }
