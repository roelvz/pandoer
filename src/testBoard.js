import React from 'react';
import { cardToString, cidToCard, cardToCid, cardsToCid } from './cardUtils';
import { shouldAnnounce, isLegalPlay } from './pandoerRules';
import Hand from "./PlayingCard/Hand/Hand";
import PlayingCard from "./PlayingCard/Hand/PlayingCard/PlayingCard";

class TestPandoerTable extends React.Component {
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
    this.acceptResult1 = this.acceptResult1.bind(this);
    this.acceptResult2 = this.acceptResult2.bind(this);
    this.acceptResult3 = this.acceptResult3.bind(this);
    this.acceptResult4 = this.acceptResult4.bind(this);
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

  acceptResult1() { this.props.moves.acceptResult(0); }
  acceptResult2() { this.props.moves.acceptResult(1); }
  acceptResult3() { this.props.moves.acceptResult(2); }
  acceptResult4() { this.props.moves.acceptResult(3); }

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

  simulate() {
    if (this.props.G.players[this.props.ctx.currentPlayer].hand.length === 1) {
      return;
    }

    if (this.props.ctx.phase === 'shouts') {
      if (this.props.ctx.currentPlayer === '0') {
        this.props.moves.shout(200);
      } else {
        this.props.moves.pass();
      }
    } else {
      if (shouldAnnounce(this.props.G, this.props.ctx, this.props.ctx.currentPlayer)) {
        this.props.moves.announce();
      } else {
        for (const card of this.props.G.players[this.props.ctx.currentPlayer].hand) {
          if (isLegalPlay(this.props.G, this.props.ctx, card)) {
            this.props.moves.playCard(card);
            break;
          }
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

    function getCountPhaseInfo(that) {
      if (that.props.ctx.phase === 'countPoints') {
        let extraInfo1 = '';
        let extraInfo2 = '';

        if (that.props.G.attackingTeam === 0) {
          extraInfo1 = ' waarvan ' + (that.props.G.playersKnownInfo['0'].announcementScore + that.props.G.playersKnownInfo['2'].announcementScore) + ' toon';
        } else {
          extraInfo2 = ' waarvan ' + (that.props.G.playersKnownInfo['1'].announcementScore + that.props.G.playersKnownInfo['3'].announcementScore) + ' toon';
        }

        let winner;
        if (that.props.G.roundScore[0] > that.props.G.roundScore[1]) {
          winner = <h1>Team 1 is gewonnen</h1>
        } else {
          winner = <h1>Team 2 is gewonnen</h1>
        }

        return <div>
          {winner}
          Team 1 heeft {that.props.G.roundScore[0]} punten{extraInfo1}:
          <div style={handStyle}>
            <Hand hide={false} layout={"fan"}
                  cards={cardsToCid(that.props.G.tricks[0].flat())}
                  cardSize={that.getCardSize(cardsToCid(that.props.G.tricks[0].flat()))}
                  onClick={() => {}}></Hand>
          </div>
          Team 2 heeft {that.props.G.roundScore[1]} punten{extraInfo2}:
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

    return (
        <div>
          Team 1: {this.props.G.scoreBoard[0]}<br/>
          Team 2: {this.props.G.scoreBoard[1]}<br/><br/>

          fase: { this.props.ctx.phase === 'shouts' ? 'roepen' : (this.props.ctx.phase === 'play' ? 'spelen' : 'punten tellen')}<br/>
          beurt: {this.props.ctx.turn}<br/><br/>

          {getCountPhaseInfo(this)}

          {this.props.G.playersKnownInfo[0].name}: {this.props.G.players[0].hand.length} | {this.props.G.playersKnownInfo[0].shout || (this.props.G.playersKnownInfo[0].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.playersKnownInfo[1].name}: {this.props.G.players[1].hand.length} | {this.props.G.playersKnownInfo[1].shout || (this.props.G.playersKnownInfo[1].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.playersKnownInfo[2].name}: {this.props.G.players[2].hand.length} | {this.props.G.playersKnownInfo[2].shout || (this.props.G.playersKnownInfo[2].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.playersKnownInfo[3].name}: {this.props.G.players[3].hand.length} | {this.props.G.playersKnownInfo[3].shout || (this.props.G.playersKnownInfo[3].passed ? 'pas' : 'niet geroepen')}<br/><br/>
          <input onChange={this.handleChange}/><button onClick={this.shout}>Roepen</button><button onClick={this.pass}>Pas</button><br/><br/>

          Speler aan zet: {this.props.G.playersKnownInfo[this.props.ctx.currentPlayer].name}<br/>
          Hoogst roepende speler: {this.props.G.highestShoutingPlayer !== undefined ? this.props.G.playersKnownInfo[this.props.G.highestShoutingPlayer].name : ''}<br/><br/>
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
            <Hand hide={false} layout={this.state.layout} cards={cardsToCid(this.props.G.playersKnownInfo[this.props.ctx.currentPlayer].announcement)} cardSize={this.getCardSize(cardsToCid(this.props.G.playersKnownInfo[this.props.ctx.currentPlayer].announcement))} onClick={this.removeCard}/>
            Score: {this.props.G.playersKnownInfo[this.props.ctx.currentPlayer].announcementScore}
          </div>

          Gemel:
          {this.props.G.playersKnownInfo[0].name}: {this.props.G.playersKnownInfo[0].announcementScore} ({this.props.G.playersKnownInfo[0].announcement.length})<br/>
          {this.props.G.playersKnownInfo[1].name}: {this.props.G.playersKnownInfo[1].announcementScore} ({this.props.G.playersKnownInfo[1].announcement.length})<br/>
          {this.props.G.playersKnownInfo[2].name}: {this.props.G.playersKnownInfo[2].announcementScore} ({this.props.G.playersKnownInfo[2].announcement.length})<br/>
          {this.props.G.playersKnownInfo[3].name}: {this.props.G.playersKnownInfo[3].announcementScore} ({this.props.G.playersKnownInfo[3].announcement.length})<br/>
        </div>
    )
  }
}

export { TestPandoerTable }
