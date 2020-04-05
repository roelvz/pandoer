import { createPandoerGame } from './game';
import { PlayerView } from "boardgame.io/dist/esm/core";
const Server = require('boardgame.io/server').Server;
const server = Server({ games: [createPandoerGame(PlayerView.STRIP_SECRETS)] });
server.run(process.env.PORT || 8000);
