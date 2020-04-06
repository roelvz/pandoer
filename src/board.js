import React from 'react';
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

class PandoerTable extends React.Component {
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

    function getAction(that) {
      if (that.props.ctx.phase === 'countPoints') {
        return <h1>Allemaal accepteren om opnieuw te delen</h1>
      }

      if (that.props.ctx.currentPlayer === that.getId()) {
        if (that.props.ctx.phase === 'shouts') {
          return <div>
            <h1>Uw beurt, roepen of passen</h1>
          </div>
        } else if (shouldAnnounce(that.props.G, that.props.ctx, that.props.ctx.currentPlayer)) {
          return <div>
            <h1>Uw beurt, kies kaarten om te tonen en toon</h1>
          </div>
        } else {
          return <div>
            <h1>Uw beurt, speel een kaart</h1>
          </div>
        }
      } else {
        if (that.props.ctx.phase === 'shouts') {
          return <div>
            <h1>{that.props.G.playersKnownInfo[that.props.ctx.currentPlayer].name} is aan de beurt om te roepen of te passen</h1>
          </div>
        } else if(shouldAnnounce(that.props.G, that.props.ctx, that.props.ctx.currentPlayer)) {
          return <div>
            <h1>{that.props.G.playersKnownInfo[that.props.ctx.currentPlayer].name} is aan de beurt om te tonen</h1>
          </div>
        } else {
          return <div>
            <h1>{that.props.G.playersKnownInfo[that.props.ctx.currentPlayer].name} is aan de beurt om een kaart te spelen</h1>
          </div>
        }
      }
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
          Score: {scoreString}{button}
        </div>
      }
    }

    function getCountPhaseInfo(that) {
      if (that.props.ctx.phase === 'countPoints') {
        let info1;
        let info2;

        let winner;
        if (that.props.G.attackingTeam === 0) {
          let shoutScore = that.props.G.playersKnownInfo[0].passed ? 0 : that.props.G.playersKnownInfo[0].shout;
          shoutScore += that.props.G.playersKnownInfo[2].passed ? 0 : that.props.G.playersKnownInfo[2].shout;
          let announcementScore = that.props.G.playersKnownInfo[0].announcementScore + that.props.G.playersKnownInfo[2].announcementScore;
          info1 = 'Team 1 heeft ' + shoutScore + ' geroepen, heeft ' + announcementScore + ' getoond en haalde ' + (that.props.G.roundScore[0] - announcementScore) + ' punten';
          info2 = 'Team 2 haalde ' + that.props.G.roundScore[1] + ' punten';
          if (that.props.G.roundScore[0] >= shoutScore) {
            winner = <h1>Team 1 is gewonnen</h1>
          } else {
            winner = <h1>Team 2 is gewonnen</h1>
          }
        } else {
          let shoutScore = that.props.G.playersKnownInfo[1].passed ? 0 : that.props.G.playersKnownInfo[1].shout;
          shoutScore += that.props.G.playersKnownInfo[3].passed ? 0 : that.props.G.playersKnownInfo[3].shout;
          let announcementScore = that.props.G.playersKnownInfo[1].announcementScore + that.props.G.playersKnownInfo[3].announcementScore;
          info1 = 'Team 1 haalde ' + that.props.G.roundScore[0] + ' punten';
          info2 = 'Team 2 heeft ' + shoutScore + ' geroepen, heeft ' + announcementScore + ' getoond en haalde ' + (that.props.G.roundScore[1] - announcementScore) + ' punten';
          if (that.props.G.roundScore[0] >= shoutScore) {
            winner = <h1>Team 2 is gewonnen</h1>
          } else {
            winner = <h1>Team 1 is gewonnen</h1>
          }
        }

        return <div>
          {winner}
          {info1}:
          <div style={handStyle}>
            <Hand hide={false} layout={"fan"}
                  cards={cardsToCid(that.props.G.tricks[0].flat())}
                  cardSize={that.getCardSize(cardsToCid(that.props.G.tricks[0].flat()))}
                  onClick={() => {}}></Hand>
          </div>
          {info2}
          <div style={handStyle}>
            <Hand hide={false} layout={"fan"}
                  cards={cardsToCid(that.props.G.tricks[1].flat())}
                  cardSize={that.getCardSize(cardsToCid(that.props.G.tricks[1].flat()))}
                  onClick={() => {}}></Hand>
          </div>
          <div>
            <button onClick={that.acceptResult1}>Accept player 1</button>
            <button onClick={that.acceptResult2}>Accept player 2</button>
            <button onClick={that.acceptResult3}>Accept player 3</button>
            <button onClick={that.acceptResult4}>Accept player 4</button>
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
        return <div>
          Vorige slag:
          <div style={handStyle}>
            <Hand hide={false} layout={that.state.layout} cards={cardsToCid(that.props.G.lastTrick)}
                  cardSize={that.getCardSize(cardsToCid(that.props.G.lastTrick))} onClick={() => {
            }}/>
          </div>
        </div>
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

    function getMain(that) {
      if (that.props.ctx.phase === 'countPoints') {
        return getCountPhaseInfo(that);
      } else {
        return <div>Speler aan beurt: {that.props.G.playersKnownInfo[that.props.ctx.currentPlayer.toString()].name}<br/><br/>
          {getAnnouncementForm(that)}
          Geroepen:<br/>
          {getPlayerShoutString(that.props.G.playersKnownInfo[0])}
          {getPlayerShoutString(that.props.G.playersKnownInfo[1])}
          {getPlayerShoutString(that.props.G.playersKnownInfo[2])}
          {getPlayerShoutString(that.props.G.playersKnownInfo[3])}<br/>

          {/*Attacking team: {that.props.G.attackingTeam}<br/>*/}
          Team 1: Aantal slagen: {that.props.G.tricks[0].length} {that.props.G.attackingTeam === undefined ? '' : (that.props.G.attackingTeam === 0 ? '(de goei)' : '(de slechte)')}<br/>
          Team 2: Aantal slagen: {that.props.G.tricks[1].length} {that.props.G.attackingTeam === undefined ? '' : (that.props.G.attackingTeam === 1 ? '(de goei)' : '(de slechte)')}<br/><br/>
          Troef: {suitInDutch(that.props.G.trump)}<br/><br/>

          Tafel:
          <div style={handStyle}>
            <Hand hide={false} layout={that.state.layout} cards={cardsToCid(that.props.G.table)} cardSize={that.getCardSize(cardsToCid(that.props.G.table))} onClick={()=>{}}/>
          </div>
          Hand:
          <div style={handStyle}>
            <Hand hide={false} layout={that.state.layout} cards={cardsToCid(that.props.G.players[that.getId()].hand)} onClick={that.play} cardSize={that.getCardSize(cardsToCid(that.props.G.players[that.getId()].hand))}/>{showLastPlayedCard(this, that.props.G.players[that.getId()].lastPlayedCard)}
          </div>
          <br/>
          <div>
            Uw laatst gespeelde kaart: {showLastPlayedCard(that, that.props.G.playersKnownInfo[that.getId()].lastPlayedCard)}
            {getAnnouncement(that)}

            <div>
              {getLastTrick(that)}
            </div>
            <br/>
            <button onClick={that.resign}>Opgeven</button><br/><br/>

            <button onClick={that.resetGame}>Spel volledig herstarten</button>
          </div>
        </div>
      }
    }

    return (
        <div>
          {getAction(this)}
          Boom:<br/>
          Team 1: {this.props.G.scoreBoard[0]}<br/>
          Team 2: {this.props.G.scoreBoard[1]}<br/><br/>
          Fase: { this.props.ctx.phase === 'shouts' ? 'roepen' : (this.props.ctx.phase === 'play' ? 'spelen' : 'punten tellen')}<br/>

          {getMain(this)}
        </div>
    )
  }
}

export { PandoerTable }
