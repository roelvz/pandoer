const Server = require('boardgame.io/server').Server;
const Pandoer = require('./game').Pandoer;
const server = Server({ games: [Pandoer] });
server.run(8000);
