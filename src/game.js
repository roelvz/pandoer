import { initDeck, dealCards } from "./cardUtils";

const startScore = 25; // both teams start at 25 on the scoreBoard (den boom)

const Pandoer = {
  setup: () => ({
    scoreBoard: [startScore, startScore],
    roundScore: [0,0],
    dealer: 0,
    deck: initDeck(),
    players: [
      {
        name: "Roel",
        cards: [],
      },
      {
        name: "Bart",
        cards: [],
      },
      {
        name: "Sam",
        cards: [],
      },
      {
        name: "Jasper",
        cards: [],
      }
    ],
  }),

  turn: {
    onBegin: (G, ctx) => {
      // Deal cards to player if deck is not empty
      if (G.deck.length > 0) {
        dealCards(G, ctx)
      }
    },

    order: {
      // default behaviour: start with first player
      first: (G, ctx) => 0,
      // default behaviour: round robin
      next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
      playOrder: (G, ctx) => ctx.turn > 0 && ctx.phase === 'shouts' ?
          // this increases the first player (i.e. the dealer) at the beginning of each shouts phase
          ctx.playOrder.map(s => ((parseInt(s) + 1) % ctx.numPlayers).toString()) :
          ctx.playOrder
    }
  },

  phases: {
    shouts: {
      start: true,
      next: 'play',
      moves: {
        shout(G, ctx, value) {
        },
        pass(G, ctx) {
        }
      }
    },

    play: {
      next: 'shouts',
      moves: {
        playCard(G, ctx, card) {
        },
        announce(G, ctx, value) {
        }
      }
    }
  },
};

export { Pandoer }
