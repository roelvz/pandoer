import React from 'react';
import { cidToCard, cardToCid, cardsToCid, suitInDutch } from './cardUtils';
import { shouldAnnounce, isLegalPlay, getPlayerId } from './game';
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
    this.getId = this.getId.bind(this);
    this.announce = this.announce.bind(this);
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

  announce() {
    this.props.moves.announce();
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

    function getAnnouncement(that) {
      let playerId;
      if (shouldAnnounce(that.props.G, that.props.ctx, that.getId())) {
        playerId = that.getId();
      } else if (that.props.G.lastAnnouncingPlayer && that.props.G.playersKnownInfo[that.props.G.lastAnnouncingPlayer].hasAnnounced) {
        playerId = that.props.G.lastAnnouncingPlayer;
      } else {
        return;
      }
      return <div style={handStyle}>
        <Hand hide={false}
              layout={that.state.layout}
              cards={cardsToCid(that.props.G.playersKnownInfo[playerId].announcement)}
              cardSize={that.getCardSize(cardsToCid(that.props.G.playersKnownInfo[playerId].announcement))} onClick={that.removeCard}/>
        Score: {that.props.G.playersKnownInfo[playerId].announcementScore}<button onClick={that.announce}>Tonen</button>
      </div>
    }

    return (
        <div>
          {getAction(this)}
          {/*PlayerID: {this.getId()}<br/>*/}
          Boom:<br/>
          Team 1: {this.props.G.scoreBoard[0]}<br/>
          Team 2: {this.props.G.scoreBoard[1]}<br/><br/>
          Fase: {this.props.ctx.phase === 'shouts' ? 'roepen' : 'spelen'}<br/>
          Speler aan beurt: {this.props.G.playersKnownInfo[this.props.ctx.currentPlayer.toString()].name}<br/><br/>

          <input onChange={this.handleChange}/><button onClick={this.shout}>Roepen</button><button onClick={this.pass}>Pas</button><br/><br/>

          Roepen:<br/>
          {this.props.G.playersKnownInfo[0].name}: {this.props.G.playersKnownInfo[0].shout || (this.props.G.playersKnownInfo[0].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.playersKnownInfo[1].name}: {this.props.G.playersKnownInfo[1].shout || (this.props.G.playersKnownInfo[1].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.playersKnownInfo[2].name}: {this.props.G.playersKnownInfo[2].shout || (this.props.G.playersKnownInfo[2].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.playersKnownInfo[3].name}: {this.props.G.playersKnownInfo[3].shout || (this.props.G.playersKnownInfo[3].passed ? 'pas' : 'niet geroepen')}<br/><br/>

          {/*Attacking team: {this.props.G.attackingTeam}<br/>*/}
          Team 1: Aantal slagen: {this.props.G.tricks[0].length} {this.props.G.attackingTeam === 0 ? '(de goei)' : '(de slechte)'}<br/>
          Team 2: Aantal slagen: {this.props.G.tricks[1].length} {this.props.G.attackingTeam === 1 ? '(de goei)' : '(de slechte)'}<br/><br/>

          Troef: {suitInDutch(this.props.G.trump)}<br/><br/>

          Tafel:
          <div style={handStyle}>
            <Hand hide={false} layout={this.state.layout} cards={cardsToCid(this.props.G.table)} cardSize={this.getCardSize(cardsToCid(this.props.G.table))} onClick={()=>{}}/>
          </div>
          Hand:
          <div style={handStyle}>
            <Hand hide={false} layout={this.state.layout} cards={cardsToCid(this.props.G.players[this.getId()].hand)} onClick={this.play} cardSize={this.getCardSize(cardsToCid(this.props.G.players[this.getId()].hand))}/>{showLastPlayedCard(this, this.props.G.players[this.getId()].lastPlayedCard)}
          </div>
          <br/>
          <div>
            Laatst gespeelde kaart: {showLastPlayedCard(this, this.props.G.playersKnownInfo[this.getId()].lastPlayedCard)}
          </div>
          <br/>

          Toon:
          {getAnnouncement(this)}<br/><br/>

          <button onClick={this.resign}>Opgeven</button><br/><br/>

          <button onClick={this.resetGame}>End game</button>
        </div>
    )
  }
}

export { PandoerTable }
