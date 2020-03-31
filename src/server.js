const Server = require('boardgame.io/server').Server;
const Pandoer = require('./game').Pandoer;
const server = Server({ games: [Pandoer] });
server.run(process.env.PORT || 8000);
