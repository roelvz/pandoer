import { INVALID_MOVE } from 'boardgame.io/core';
import { Suits, initDeck, dealCards, cardToString, removeCard, containsRanksForSuit, containsSuitsForRank,
  removeRanksForSuit, removeSuitsForRank} from "./cardUtils";

// TODO: rondpassen

const startScore = 25; // both teams start at 25 on the scoreBoard (den boom)
const trumpRankOrder = [8,10,12,13,14,9,11];


function getPlayerTeam(player) {
  return player % 2 === 0 ? 0 : 1;
}

function isLegalShoutValue(value) {
  return value !== undefined && value >= 200 && value % 10 === 0;
}

function isLegalPlay(G, ctx, card) {
  return (
      // any card can be played if trump has not been chosen yet (this card's suit will become trump)
      G.trump === undefined ||
      // any card can be played if table is empty
      G.table.length === 0 ||
      // trump card can always be played
      card.suit === G.trump ||
      // non-trump card can only be played if has the same suit as the first card on the table ...
      card.suit === G.table[0].suit ||
      // ... or if the player has no cards of this suit
      G.players[ctx.currentPlayer].cards.filter(c => c.suit === G.table[0].suit).length === 0
  );
}

function isCard1HigherThanCard2(G, card1, card2) {
  if (G.trump === card1.suit && G.trump !== card2.suit) {
    // card 1 wins if it is trump and the other card not
    return true;
  } else if (G.trump === card2.suit && G.trump !== card1.suit) {
    // card 2 loses if it is not trump and the other card is
    return false;
  } else if (G.trump === card1.suit && G.trump === card2.suit) {
    // use trump rank order in case both cards are trump
    return trumpRankOrder.indexOf(card1.rank) > trumpRankOrder.indexOf(card2.rank);
  } else if (card1.suit !== G.table[0].suit) {
    // card1 loses if it is not trump and it has a different suit than the first card on the table
    return false;
  } else if (card2.suit !== G.table[0].suit) {
    // card1 wins if it has the same suit as the first card on the table and card2 hasn't
    return true;
  } else {
    // compare ranks if both cards have the same suit as the first card on the table
    return card1.rank > card2.rank;
  }
}

function getCardScore(trump, card) {
  if (trump === card.suit) {
    switch (card.rank) {
      case 8:
      case 9:
        return 0;
      case 10:
        return 10;
      case 11:
        return 1;
      case 12:
        return 2;
      case 13:
        return 3;
      case 14:
        return 11;
      default:
        return 0;
    }
  } else {
    switch (card.rank) {
      case 8:
        return 0;
      case 9:
        return 14;
      case 10:
        return 10;
      case 11:
        return 20;
      case 12:
        return 2;
      case 13:
        return 3;
      case 14:
        return 11;
      default:
        return 0;
    }
  }
}

function getAnnouncementScore(cards, ignoreMarriage = false) {
  let result = 0;
  let left = cards;

  function check4CardsOfTheSameRank(rank) {
    return (left = removeSuitsForRank(left, rank, Suits)).length < cards.length;
  }

  function check5ConsecutiveCards(suit) {
    return (
        (left = removeRanksForSuit(left, suit, [8,9,10,11,12])).length < cards.length ? 100 : 0 ||
        (left = removeRanksForSuit(left, suit, [9,10,11,12,13])).length < cards.length ? 100 : 0  ||
        (left = removeRanksForSuit(left, suit, [10,11,12,13,14])).length < cards.length ? 100 : 0
    );
  }

  function check4ConsecutiveCards(suit) {
    return (
        (left = removeRanksForSuit(left, suit, [8,9,10,11])).length < cards.length ? 50 : 0 ||
        (left = removeRanksForSuit(left, suit, [9,10,11,12])).length < cards.length ? 50 : 0  ||
        (left = removeRanksForSuit(left, suit, [10,11,12,13])).length < cards.length ? 50 : 0 ||
        (left = removeRanksForSuit(left, suit, [11,12,13,14])).length < cards.length ? 50 : 0
    );
  }

  function check3ConsecutiveCards(suit) {
    return (
        (left = removeRanksForSuit(left, suit, [8,9,10])).length < cards.length ? 20 : 0 ||
        (left = removeRanksForSuit(left, suit, [9,10,11])).length < cards.length ? 20 : 0  ||
        (left = removeRanksForSuit(left, suit, [10,11,12])).length < cards.length ? 20 : 0 ||
        (left = removeRanksForSuit(left, suit, [11,12,13])).length < cards.length ? 20 : 0 ||
        (left = removeRanksForSuit(left, suit, [12,13,14])).length < cards.length ? 20 : 0
    );
  }

  if (check4CardsOfTheSameRank(11)) {
    // 4 Jacks of different suit: 200 points
    result += 200;
  } else if (check4CardsOfTheSameRank(14)) {
    // 4 Aces of different suit: 100 points
    result += 100;
  } else if (check4CardsOfTheSameRank(13)) {
    // 4 Kings of different suit: 100 points
    result += 100;
  } else if (check4CardsOfTheSameRank(12)) {
    // 4 Queens of different suit: 100 points
    result += 100;
  } else {
    // 5 consecutive cards
    let fifth = check5ConsecutiveCards('Hearts');
    if (fifth > 0) { result += fifth; }
    if (result === 0) {
      fifth = check5ConsecutiveCards('Clubs');
      if (fifth > 0) { result += fifth; }
    }
    if (result === 0) {
      fifth = check5ConsecutiveCards('Diamonds');
      if (fifth > 0) { result += fifth; }
    }
    if (result === 0) {
      fifth = check5ConsecutiveCards('Spades');
      if (fifth > 0) { result += fifth; }
    }

    // 4 consecutive cards
    let fourth = 0;
    if (result === 0) {
      fourth = check4ConsecutiveCards('Hearts');
      if (fourth > 0) { result += fourth; }
    }
    if (result === 0) {
      fourth = check4ConsecutiveCards('Clubs');
      if (fourth > 0) { result += fourth; }
    }
    if (result === 0) {
      fourth = check4ConsecutiveCards('Diamonds');
      if (fourth > 0) { result += fourth; }
    }
    if (result === 0) {
      fourth = check4ConsecutiveCards('Spades');
      if (fourth > 0) { result += fourth; }
    }

    // 3 consecutive cards
    let third = 0;
    if (result === 0) {
      third = check3ConsecutiveCards('Hearts');
      if (third > 0) { result += third; }
    }
    if (result === 0) {
      third = check3ConsecutiveCards('Clubs');
      if (third > 0) { result += third; }
    }
    if (result === 0) {
      third = check3ConsecutiveCards('Diamonds');
      if (third > 0) { result += third; }
    }
    if (result === 0) {
      third = check3ConsecutiveCards('Spades');
      if (third > 0) { result += third; }
    }
  }

  if (result > 0 && left.length > 0) {
    result += getAnnouncementScore(left, true);
  }

  function checkMarriage(suit) {
   if (removeRanksForSuit(cards, suit, [12,13]).length === cards.length - 2) {
     if (removeRanksForSuit(cards, suit, [12,13,12,13]).length === cards.length - 4) {
       return 40;
     } else {
       return 20;
     }
   }
   return 0;
  }

  // marriage
  if (!ignoreMarriage) {
    result += checkMarriage('Hearts');
    result += checkMarriage('Diamonds');
    result += checkMarriage('Clubs');
    result += checkMarriage('Spades');
  }

  return result;
}

function shouldAnnounce(G, ctx) {
  console.log(G.table.length);
  console.log(getPlayerTeam(ctx.currentPlayer));
  console.log(getPlayerTeam(G.attackingTeam));
  return G.table.length >= 4 && G.table.length <= 7 && getPlayerTeam(ctx.currentPlayer) === G.attackingTeam;
}

const Pandoer = {
  setup: () => ({
    // The overall scoreboard (den boom)
    scoreBoard: [startScore, startScore],
    deck: initDeck(),
    // Represents all cards on the table
    table: [],

    // The score for 1 round of playing
    roundScore: [0,0],
    // tricks ('slagen') per team for this round
    tricks: [[],[]],
    highestShoutingPlayer: undefined,
    attackingTeam: undefined,
    trump: undefined,
    highestCardOnTable: undefined,
    playerWithHighestCardOnTable: undefined,

    players: [
      {
        name: "Roel",
        cards: [],
        shout: undefined,
        passed: false,
        announcement: [],
      },
      {
        name: "Bart",
        cards: [],
        shout: undefined,
        passed: false,
        announcement: [],
      },
      {
        name: "Sam",
        cards: [],
        shout: undefined,
        passed: false,
        announcement: [],
      },
      {
        name: "Jasper",
        cards: [],
        shout: undefined,
        passed: false,
        announcement: [],
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

    endIf(G, ctx) {
      // end turn if player has shouted or passed
      let p = G.players[ctx.currentPlayer];
      return p.shout !== undefined || p.passed;
    },

    order: {
      // default behaviour: start with first player
      first: (G, ctx) => 0,
      // default behaviour: round robin
      next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
      playOrder: (G, ctx) => {
        if (ctx.turn > 0) {
          if (ctx.phase === 'shouts') {
            return ctx.playOrder.map(s => ((parseInt(s) + 1) % ctx.numPlayers).toString());
          } else if (G.highestShoutingPlayer !== undefined) {
            return [G.highestShoutingPlayer,
              (parseInt(G.highestShoutingPlayer) + 1 % 4).toString(),
              (parseInt(G.highestShoutingPlayer) + 2 % 4).toString(),
              (parseInt(G.highestShoutingPlayer) + 3 % 4).toString()];
          }
        }
        return ctx.playOrder;
      }
    },
  },

  phases: {
    shouts: {
      start: true,
      next: 'play',
      moves: {
        shout(G, ctx, value) {
          if (isLegalShoutValue(value) &&
              (G.highestShoutingPlayer === undefined || value > G.players[G.highestShoutingPlayer].shout)) {
            // player has shouted the highest so far
            G.highestShoutingPlayer = ctx.currentPlayer;
            G.players[ctx.currentPlayer].shout = value;
          } else {
            // player mad an illegal shout
            return INVALID_MOVE;
          }
        },

        pass(G, ctx) {
          // clear player's shout and pass turn
          G.players[ctx.currentPlayer].passed = true;
          G.players[ctx.currentPlayer].shout = undefined;
        },
      },

      endIf(G, ctx) {
        // end phase if all players have either shouted or passed
        return G.players.filter(p => p.shout === undefined && !p.passed).length === 0;
      },
    },

    play: {
      next: 'shouts',
      moves: {
        playCard(G, ctx, card) {
          console.log('Playing card: ' + cardToString(card));
          if (!isLegalPlay(G, ctx, card)) {
            return INVALID_MOVE;
          }

          // Set trump if it hasn't been set yet
          if (G.trump === undefined) {
            G.trump = card.suit;
          }

          // remove card from player's deck
          G.players[ctx.currentPlayer].cards = removeCard(G.players[ctx.currentPlayer].cards, card);

          // Check if card is new highest card on table
          if (G.highestCardOnTable === undefined || isCard1HigherThanCard2(G, card, G.highestCardOnTable)) {
            G.highestCardOnTable = card;
            G.playerWithHighestCardOnTable = ctx.currentPlayer;
          }

          // add card to table
          G.table.push(card);
        },

        announce(G, ctx, cards) {
          if (shouldAnnounce(G, ctx)) {
            G.players[ctx.currentPlayer].announcement = cards;
            G.players[ctx.currentPlayer].announcementScore = getAnnouncementScore(cards);
            G.roundScore[getPlayerTeam(ctx.currentPlayer)] += G.players[ctx.currentPlayer].announcementScore;
          } else {
            return INVALID_MOVE;
          }
        },
      },

      endIf(G, ctx) {
        // end phase if four cards are on the table
        return G.table.length === 4;
      },

      onEnd(G, ctx) {
        let team = getPlayerTeam(G.playerWithHighestCardOnTable);

        // Add the score of all cards on the table to the score of the team
        for (const card of G.table) {
          G.roundScore[team] += getCardScore(G.trump, card);
        }

        // Clear table
        G.table = [];
        G.tricks[getPlayerTeam(ctx.currentPlayer)].push(G.table);

        return G;
      },
    },
  },
};

export { getAnnouncementScore, Pandoer }
