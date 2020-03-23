import React from 'react';
import { cardToString } from './cardUtils';

class PandoerTable extends React.Component {
  render() {
    return (
        <div>
          phase: {this.props.ctx.phase}<br/>
          turn: {this.props.ctx.turn}<br/><br/>

          {this.props.G.players[0].name}: {this.props.G.players[0].cards.length} | {this.props.G.players[0].shout || (this.props.G.players[0].passed ? 'passed' : 'no shout')}<br/>
          {this.props.G.players[1].name}: {this.props.G.players[1].cards.length} | {this.props.G.players[1].shout || (this.props.G.players[1].passed ? 'passed' : 'no shout')}<br/>
          {this.props.G.players[2].name}: {this.props.G.players[2].cards.length} | {this.props.G.players[2].shout || (this.props.G.players[2].passed ? 'passed' : 'no shout')}<br/>
          {this.props.G.players[3].name}: {this.props.G.players[3].cards.length} | {this.props.G.players[3].shout || (this.props.G.players[3].passed ? 'passed' : 'no shout')}<br/><br/>

          Current player: {this.props.G.players[this.props.ctx.currentPlayer].name}<br/><br/>

          Highest shouting player: {this.props.G.highestShoutingPlayer}<br/><br/>

          Highest card on table: {cardToString(this.props.G.highestCardOnTable)}<br/><br/>

          Player with highest card on table: {this.props.G.playerWithHighestCardOnTable}<br/><br/>

          Trump: {this.props.G.trump}<br/>
          Table 0: {cardToString(this.props.G.table[0])}<br/>
          Table 1: {cardToString(this.props.G.table[1])}<br/>
          Table 2: {cardToString(this.props.G.table[2])}<br/>
          Table 3: {cardToString(this.props.G.table[3])}
        </div>

    )
  }
}

export { PandoerTable }
