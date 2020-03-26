import React from 'react';
import { cardToString, getCardUri, cidToCard } from './cardUtils';
import cards from './cards.js';

let set = false;

class PandoerTable extends React.Component {
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
      for (const card of player.cards) {
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

          {this.props.G.players[0].name}: {this.props.G.players[0].cards.length} | {this.props.G.players[0].shout || (this.props.G.players[0].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.players[1].name}: {this.props.G.players[1].cards.length} | {this.props.G.players[1].shout || (this.props.G.players[1].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.players[2].name}: {this.props.G.players[2].cards.length} | {this.props.G.players[2].shout || (this.props.G.players[2].passed ? 'pas' : 'niet geroepen')}<br/>
          {this.props.G.players[3].name}: {this.props.G.players[3].cards.length} | {this.props.G.players[3].shout || (this.props.G.players[3].passed ? 'pas' : 'niet geroepen')}<br/><br/>

          Speler aan zet: {this.props.G.players[this.props.ctx.currentPlayer].name}<br/><br/>

          Hoogst roepende speler: {this.props.G.highestShoutingPlayer}<br/><br/>

          Hoogste kaart op tafel: {cardToString(this.props.G.highestCardOnTable)}<br/><br/>

          Speler met hoogste kaart op tafel: {this.props.G.playerWithHighestCardOnTable}<br/><br/>

          Tafel:
          {table[0]}
          {table[1]}
          {table[2]}
          {table[3]}<br/>

          Troef: {this.props.G.trump}<br/>
          Handen: <br/>
          {hands[0]}<br/>
          {hands[1]}<br/>
          {hands[2]}<br/>
          {hands[3]}<br/>
        </div>

    )
  }
}

export { PandoerTable }
