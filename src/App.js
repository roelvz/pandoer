// src/App.js

import React from 'react';
import { render } from "react-dom";
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer'
import { Pandoer } from './game';
import { PlayerView } from 'boardgame.io/core';
import { PandoerTable } from './board';
import { TestPandoerTable } from './testBoard';

// const App = Client({
//   game: Pandoer,
//   board: TestPandoerTable,
//   numPlayers: 4,
//   debug: false,
// });

const PandoerClient = Client({
  game: Pandoer,
  board: PandoerTable,
  numPlayers: 4,
  multiplayer: SocketIO({server: 'https://pandoer-server.herokuapp.com/' }),
  debug: false,
  playerView: PlayerView.STRIP_SECRETS,
});

class App extends React.Component {
  state = { playerId: null };

  render() {
    if (this.state.playerID === undefined) {
      return (
          <div>
            <p>Play as</p>
            <button onClick={() => this.setState({playerID: "0"})}>Player 1</button>
            <button onClick={() => this.setState({playerID: "1"})}>Player 2</button>
            <button onClick={() => this.setState({playerID: "2"})}>Player 3</button>
            <button onClick={() => this.setState({playerID: "3"})}>Player 4</button>
          </div>
      );
    }
    return (
        <div>
          {/*Player ID: {this.state.playerID}*/}
          <PandoerClient playerID={this.state.playerID} />
        </div>
    );
  }
}

render(<App />, document.getElementById("root"));

export default App;
