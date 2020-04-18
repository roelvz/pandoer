// src/App.js

import React from 'react';
import { render } from "react-dom";
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer'
import { createPandoerGame } from './game';
import { PlayerView } from 'boardgame.io/core';
import { PandoerBoard } from './board';
import { TestPandoerTable } from './testBoard';

// const App = Client({
//   game: createPandoerGame(),
//   board: TestPandoerTable,
//   numPlayers: 4,
//   debug: false,
// });

const PandoerClient = Client({
  game: createPandoerGame(PlayerView.STRIP_SECRETS),
  board: PandoerBoard,
  numPlayers: 4,
  multiplayer: SocketIO({server: 'https://pandoer-server.herokuapp.com/' }),
  debug: false,
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
          <PandoerClient playerID={this.state.playerID} />
        </div>
    );
  }
}

render(<App />, document.getElementById("root"));

export default App;
