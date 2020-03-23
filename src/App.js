// src/App.js

import { Client } from 'boardgame.io/react';
import { Pandoer } from './game';
import { PandoerTable } from './board';

const App = Client({
  game: Pandoer,
  board: PandoerTable,
  numPlayers: 4
});

export default App;
