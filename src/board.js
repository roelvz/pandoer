import React from 'react';
import { cardToString, cidToCard, cardToCid, cardsToCid } from './cardUtils';
import { shouldAnnounce, isLegalPlay } from './game';
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
    this.simulate = this.simulate.bind(this);
    this.shout = this.shout.bind(this);
    this.pass = this.pass.bind(this);
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

  play(key) {
    console.log('clicked on card in hand: ' + key);
    if (shouldAnnounce(this.props.G, this.props.ctx)) {
      this.props.moves.addCardToAnnouncement(cidToCard(key));
    } else {
      this.props.moves.playCard(cidToCard(key));
    }
  }

  removeCard(key) {
    this.props.moves.removeCardFromAnnouncement(cidToCard(key));
  }

  simulate() {
    if (this.props.ctx.phase === 'shouts') {
      if (this.props.ctx.currentPlayer === '0') {
        this.props.moves.shout(200);
      } else {
        this.props.moves.pass();
      }
    } else {
      if (shouldAnnounce(this.props.G, this.props.ctx)) {
        this.props.moves.announce();
      }
      for (const card of this.props.G.players[this.props.ctx.currentPlayer].hand) {
        if (isLegalPlay(this.props.G, this.props.ctx, card)) {
          this.props.moves.playCard(card);
          break;
        }
      }
    }

    setTimeout(() => {
      this.simulate();
    }, 1);
  }

  render() {
    const handStyle = {
      margin: "auto",
      width: "70%",
    };

    function showLastPlayedCard(that, card) {
      if (card !== undefined) {
        return <PlayingCard card={cardToCid(card)} height={100} onClick={that.play}/>
      }
    }

    return (
        <div>
          Team 1: {this.props.G.scoreBoard[0]}<br/>
          Team 2: {this.props.G.scoreBoard[1]}<br/><br/>

          fase: {this.props.ctx.phase === 'shouts' ? 'roepen' : 'spelen'}<br/>
          beurt: {this.props.ctx.turn}<br/><br/>

          {this.props.G.players[0].name}: {this.props.G.players[0].hand.length} | {this.props.G.players[0].shout || (this.props.G.players[0].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.players[1].name}: {this.props.G.players[1].hand.length} | {this.props.G.players[1].shout || (this.props.G.players[1].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.players[2].name}: {this.props.G.players[2].hand.length} | {this.props.G.players[2].shout || (this.props.G.players[2].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.players[3].name}: {this.props.G.players[3].hand.length} | {this.props.G.players[3].shout || (this.props.G.players[3].passed ? 'pas' : 'niet geroepen')}<br/><br/>
          <input onChange={this.handleChange}/><button onClick={this.shout}>Roepen</button><button onClick={this.pass}>Pas</button><br/><br/>

          Speler aan zet: {this.props.G.players[this.props.ctx.currentPlayer].name}<br/>
          Hoogst roepende speler: {this.props.G.highestShoutingPlayer !== undefined ? this.props.G.players[this.props.G.highestShoutingPlayer].name : ''}<br/><br/>
          Hoogste kaart op tafel: {cardToString(this.props.G.highestCardOnTable)}<br/>
          Speler met hoogste kaart op tafel: {this.props.G.playerWithHighestCardOnTable}<br/>
          Aanvallend team: {this.props.G.attackingTeam}<br/><br/>

          # score team 1: {this.props.G.roundScore[0]} ({this.props.G.tricks[0].length} slagen)<br/>
          # score team 2: {this.props.G.roundScore[1]} ({this.props.G.tricks[1].length} slagen)<br/>

          Tafel:
          <div style={handStyle}>
            <Hand hide={false} layout={this.state.layout} cards={cardsToCid(this.props.G.table)} cardSize={this.getCardSize(cardsToCid(this.props.G.table))} onClick={()=>{}}/>
          </div>

          Troef: {this.props.G.trump}<br/><br/>
          <button id={"simulate"} onClick={this.simulate}>Simulate</button><br/><br/>
          Handen: <br/>
          <div style={handStyle}>
            <Hand hide={false} layout={this.state.layout} cards={cardsToCid(this.props.G.players[0].hand)} onClick={this.play} cardSize={this.getCardSize(cardsToCid(this.props.G.players[0].hand))}/>{showLastPlayedCard(this, this.props.G.players[0].lastPlayedCard)}
            <Hand hide={false} layout={this.state.layout} cards={cardsToCid(this.props.G.players[1].hand)} onClick={this.play} cardSize={this.getCardSize(cardsToCid(this.props.G.players[1].hand))}/>{showLastPlayedCard(this, this.props.G.players[1].lastPlayedCard)}
            <Hand hide={false} layout={this.state.layout} cards={cardsToCid(this.props.G.players[2].hand)} onClick={this.play} cardSize={this.getCardSize(cardsToCid(this.props.G.players[2].hand))}/>{showLastPlayedCard(this, this.props.G.players[2].lastPlayedCard)}
            <Hand hide={false} layout={this.state.layout} cards={cardsToCid(this.props.G.players[3].hand)} onClick={this.play} cardSize={this.getCardSize(cardsToCid(this.props.G.players[3].hand))}/>{showLastPlayedCard(this, this.props.G.players[3].lastPlayedCard)}
          </div>

          Toon:
          <div style={handStyle}>
            <Hand hide={false} layout={this.state.layout} cards={cardsToCid(this.props.G.players[this.props.ctx.currentPlayer].announcement)} cardSize={this.getCardSize(cardsToCid(this.props.G.players[this.props.ctx.currentPlayer].announcement))} onClick={this.removeCard}/>
            Score: {this.props.G.players[this.props.ctx.currentPlayer].announcementScore}
          </div>

          Gemel:
          {this.props.G.players[0].name}: {this.props.G.players[0].announcementScore} ({this.props.G.players[0].announcement.length})<br/>
          {this.props.G.players[1].name}: {this.props.G.players[1].announcementScore} ({this.props.G.players[1].announcement.length})<br/>
          {this.props.G.players[2].name}: {this.props.G.players[2].announcementScore} ({this.props.G.players[2].announcement.length})<br/>
          {this.props.G.players[3].name}: {this.props.G.players[3].announcementScore} ({this.props.G.players[3].announcement.length})<br/>
        </div>
    )
  }
}

export { PandoerTable }
