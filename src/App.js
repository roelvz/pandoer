// src/App.js

import { Client } from 'boardgame.io/react';
import { Pandoer } from './game';

const App = Client({ game: Pandoer, numPlayers: 4 });

export default App;
