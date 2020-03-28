import React from 'react';
import { cardToString, getCardUri, cidToCard } from './cardUtils';
import cards from './cards.js';

let set = false;

class PandoerTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      card: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.play = this.play.bind(this);
  }

  handleChange(event) {
    this.setState({card: event.target.value});
  }

  play(event) {
    this.props.moves.playCard(cidToCard(this.state.card));
  }

  render() {
    if (!set) {
      let that = this;
      cards.playCard = function ($card) {
        const card = cidToCard(cards.cid($card));
        that.props.moves.playCard(card);
      };
      set = true;
    }

    let hands = [];
    let i = 0;
    for (const player of this.props.G.players) {
      let hand = [];
      let cards = [];
      for (const card of player.hand) {
        cards.push(<img key={'c_' + i} className='card' alt='' src={getCardUri(card)}/>);
        i++;
      }
      hand.push(<div key={'h_' + i} className="hand hhand-compact active-hand">{cards}</div>);
      hands.push(hand);
    }

    let table = [];
    i = 0;
    for (const card of this.props.G.table) {
      let cardEl = [];
      cardEl.push(<img key={'t_' + i} className='card' alt='' src={getCardUri(card)}/>);
      i++;
      table.push(cardEl);
    }
    while (table.length < 4) {
      table.push('');
    }

    return (
        <div>
          fase: {this.props.ctx.phase === 'shouts' ? 'roepen' : 'spelen'}<br/>
          beurt: {this.props.ctx.turn}<br/><br/>

          {this.props.G.players[0].name}: {this.props.G.players[0].hand.length} | {this.props.G.players[0].shout || (this.props.G.players[0].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.players[1].name}: {this.props.G.players[1].hand.length} | {this.props.G.players[1].shout || (this.props.G.players[1].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.players[2].name}: {this.props.G.players[2].hand.length} | {this.props.G.players[2].shout || (this.props.G.players[2].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.players[3].name}: {this.props.G.players[3].hand.length} | {this.props.G.players[3].shout || (this.props.G.players[3].passed ? 'pas' : 'niet geroepen')}<br/><br/>

          Speler aan zet: {this.props.G.players[this.props.ctx.currentPlayer].name}<br/>
          Hoogst roepende speler: {this.props.G.highestShoutingPlayer !== undefined ? this.props.G.players[this.props.G.highestShoutingPlayer].name : ''}<br/><br/>
          Hoogste kaart op tafel: {cardToString(this.props.G.highestCardOnTable)}<br/>
          Speler met hoogste kaart op tafel: {this.props.G.playerWithHighestCardOnTable}<br/><br/>
          Aanvallend team: {this.props.G.attackingTeam}<br/><br/>

          # score team 1: {this.props.G.roundScore[0]} ({this.props.G.tricks[0].length} slagen)<br/>
          # score team 2: {this.props.G.roundScore[1]} ({this.props.G.tricks[1].length} slagen)<br/>

          Tafel:
          {table[0]}
          {table[1]}
          {table[2]}
          {table[3]}<br/>

          Troef: {this.props.G.trump}<br/>
          Handen: <br/>
          <input type="text" value={this.card} onChange={this.handleChange}/><button onClick={this.play}>play</button><br/>
          {hands[0]}<br/>
          {hands[1]}<br/>
          {hands[2]}<br/>
          {hands[3]}<br/><br/>

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
