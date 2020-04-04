import { INVALID_MOVE } from 'boardgame.io/core';
import { Suits, HEARTS, DIAMONDS, CLUBS, SPADES, initDeck, dealCards, removeCard, removeRanksForSuit,
  removeSuitsForRank, containsCard, sortCards, areCardsEqual } from "./cardUtils";
import {PlayerView} from "boardgame.io/dist/esm/core";

// TODO: namen van spelers
// TODO: pandoer (op tafel)
// TODO: slagen tellen / score tonen
// TODO: non-random order
// TODO: validate announcement (niet teveel laten zien)
// TODO: laatste slag tonen
// TODO: bug: aantal slagen na ronde 1 staat op 1 (fix without workaround)
// TODO: handen tonen op het einde

const startScore = 25; // both teams start at 25 on the scoreBoard (den boom)
const trumpRankOrder = [10,12,13,14,9,11];


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
      G.players[ctx.currentPlayer].hand.filter(c => c.suit === G.table[0].suit).length === 0
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
  } else {
    switch (card.rank) {
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
  }
}

function getCardsScore(trump, cards) {
  let result = 0;
  for (const card of cards) {
    result += getCardScore(trump, card);
  }
  return result;
}

function getAnnouncementScore(cards, trump, ignoreMarriage = false) {
  let result = 0;
  let left = cards;

  function check4CardsOfTheSameRank(rank) {
    return (left = removeSuitsForRank(left, rank, Suits)).length < cards.length;
  }

  function check5ConsecutiveCards(suit) {
    return (
        (left = removeRanksForSuit(left, suit, [9,10,11,12,13])).length < cards.length ? 100 : 0  ||
        (left = removeRanksForSuit(left, suit, [10,11,12,13,14])).length < cards.length ? 100 : 0
    );
  }

  function check4ConsecutiveCards(suit) {
    return (
        (left = removeRanksForSuit(left, suit, [9,10,11,12])).length < cards.length ? 50 : 0  ||
        (left = removeRanksForSuit(left, suit, [10,11,12,13])).length < cards.length ? 50 : 0 ||
        (left = removeRanksForSuit(left, suit, [11,12,13,14])).length < cards.length ? 50 : 0
    );
  }

  function check3ConsecutiveCards(suit) {
    return (
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
    let fifth = check5ConsecutiveCards(HEARTS);
    if (fifth > 0) { result += fifth; }
    if (result === 0) {
      fifth = check5ConsecutiveCards(CLUBS);
      if (fifth > 0) { result += fifth; }
    }
    if (result === 0) {
      fifth = check5ConsecutiveCards(DIAMONDS);
      if (fifth > 0) { result += fifth; }
    }
    if (result === 0) {
      fifth = check5ConsecutiveCards(SPADES);
      if (fifth > 0) { result += fifth; }
    }

    // 4 consecutive cards
    let fourth = 0;
    if (result === 0) {
      fourth = check4ConsecutiveCards(HEARTS);
      if (fourth > 0) { result += fourth; }
    }
    if (result === 0) {
      fourth = check4ConsecutiveCards(CLUBS);
      if (fourth > 0) { result += fourth; }
    }
    if (result === 0) {
      fourth = check4ConsecutiveCards(DIAMONDS);
      if (fourth > 0) { result += fourth; }
    }
    if (result === 0) {
      fourth = check4ConsecutiveCards(SPADES);
      if (fourth > 0) { result += fourth; }
    }

    // 3 consecutive cards
    let third = 0;
    if (result === 0) {
      third = check3ConsecutiveCards(HEARTS);
      if (third > 0) { result += third; }
    }
    if (result === 0) {
      third = check3ConsecutiveCards(CLUBS);
      if (third > 0) { result += third; }
    }
    if (result === 0) {
      third = check3ConsecutiveCards(DIAMONDS);
      if (third > 0) { result += third; }
    }
    if (result === 0) {
      third = check3ConsecutiveCards(SPADES);
      if (third > 0) { result += third; }
    }
  }

  if (result > 0 && left.length > 0) {
    result += getAnnouncementScore(left, trump,true);
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
    result += checkMarriage(trump);
  }

  return result;
}

function shouldAnnounce(G, ctx, playerId) {
  const hasAnnounced = G.playersKnownInfo[playerId].hasAnnounced;
  const isPartOfAttackingTeam = getPlayerTeam(playerId) === G.attackingTeam;
  const oneTrickHasBeenPlayed = G.tricks[0].length + G.tricks[1].length === 1;
  return (playerId === ctx.currentPlayer) && !hasAnnounced && isPartOfAttackingTeam && oneTrickHasBeenPlayed;
}

function getPlayerId(G, ctx) {
  return Object.keys(G.players)[0];
}

function resetTheGame(G) {
  // The overall scoreboard (den boom)
  G.scoreBoard = [startScore, startScore];
  G.deck = initDeck();
  G.table = [];

  // The score for 1 round of playing
  G.roundScore = [0, 0];
  G.roundShout = 0;
  G.dealer = 0;

  G.tricks = [[], []];
  G.lastTrick = [];
  G.highestShoutingPlayer = undefined;
  G.attackingTeam = undefined;
  G.trump = undefined;
  G.highestCardOnTable = undefined;
  G.playerWithHighestCardOnTable = undefined;
  G.playerWhoWonPreviousTrick = undefined;
  G.lastAnnouncingPlayer = undefined;
  G.resigningPlayer = undefined;
  G.playPhaseEnded = false;
  G.endGame = false;

  G.players = {
    '0': {
      hand: [],
    },
    '1': {
      hand: [],
    },
    '2': {
      hand: [],
    },
    '3': {
      hand: [],
    },
  };
  G.playersKnownInfo = {
    '0': {
      name: "Player1",
      shout: undefined,
      shoutedPandoer: false,
      shoutedPandoerOnTable: false,
      passed: false,
      hasPlayedCard: false,
      lastPlayedCard: undefined,
      lastPlayedCardInAnnouncement: false,
      hasAnnounced: false,
      announcement: [],
      announcementScore: 0,
    },
    '1': {
      name: "Player2",
      shout: undefined,
      shoutedPandoer: false,
      shoutedPandoerOnTable: false,
      passed: false,
      hasPlayedCard: false,
      lastPlayedCard: undefined,
      lastPlayedCardInAnnouncement: false,
      hasAnnounced: false,
      announcement: [],
      announcementScore: 0,
    },
    '2': {
      name: "Player3",
      shout: undefined,
      shoutedPandoer: false,
      shoutedPandoerOnTable: false,
      passed: false,
      hasPlayedCard: false,
      lastPlayedCard: undefined,
      lastPlayedCardInAnnouncement: false,
      hasAnnounced: false,
      announcement: [],
      announcementScore: 0,
    },
    '3': {
      name: "Player4",
      shout: undefined,
      shoutedPandoer: false,
      shoutedPandoerOnTable: false,
      passed: false,
      hasPlayedCard: false,
      lastPlayedCard: undefined,
      lastPlayedCardInAnnouncement: false,
      hasAnnounced: false,
      announcement: [],
      announcementScore: 0,
    }
  };
  G.shouldReset = true;
}

const Pandoer = {
  setup: () => ({
    // The overall scoreboard (den boom)
    scoreBoard: [startScore, startScore],
    deck: initDeck(),
    // Represents all cards on the table
    table: [],

    // The score for 1 round of playing
    roundScore: [0, 0],
    roundShout: 0,
    dealer: 0,
    // tricks ('slagen') per team for this round
    tricks: [[],[]],
    lastTrick: [],
    highestShoutingPlayer: undefined,
    attackingTeam: undefined,
    trump: undefined,
    highestCardOnTable: undefined,
    playerWithHighestCardOnTable: undefined,
    playerWhoWonPreviousTrick: undefined,
    lastAnnouncingPlayer: undefined,
    resigningPlayer: undefined,

    // TODO: fix workaround
    playPhaseEnded: false,

    players: {
      '0': {
        hand: [],
      },
      '1': {
        hand: [],
      },
      '2': {
        hand: [],
      },
      '3': {
        hand: [],
      },
    },
    playersKnownInfo: {
      '0': {
        name: "Player1",
        shout: undefined,
        shoutedPandoer: false,
        shoutedPandoerOnTable: false,
        passed: false,
        hasPlayedCard: false,
        lastPlayedCard: undefined,
        lastPlayedCardInAnnouncement: false,
        hasAnnounced: false,
        announcement: [],
        announcementScore: 0,
      },
      '1': {
        name: "Player2",
        shout: undefined,
        shoutedPandoer: false,
        shoutedPandoerOnTable: false,
        passed: false,
        hasPlayedCard: false,
        lastPlayedCard: undefined,
        lastPlayedCardInAnnouncement: false,
        hasAnnounced: false,
        announcement: [],
        announcementScore: 0,
      },
      '2': {
        name: "Player3",
        shout: undefined,
        shoutedPandoer: false,
        shoutedPandoerOnTable: false,
        passed: false,
        hasPlayedCard: false,
        lastPlayedCard: undefined,
        lastPlayedCardInAnnouncement: false,
        hasAnnounced: false,
        announcement: [],
        announcementScore: 0,
      },
      '3': {
        name: "Player4",
        shout: undefined,
        shoutedPandoer: false,
        shoutedPandoerOnTable: false,
        passed: false,
        hasPlayedCard: false,
        lastPlayedCard: undefined,
        lastPlayedCardInAnnouncement: false,
        hasAnnounced: false,
        announcement: [],
        announcementScore: 0,
      },
    },
    shouldReset: false,
  }),

  playerView: PlayerView.STRIP_SECRETS,

  endIf(G, ctx) {
    return G.scoreBoard[0] <= 0 || G.scoreBoard[1] <= 0;
  },

  turn: {
    onBegin: (G, ctx) => {
      // Deal cards to player if deck is not empty
      if (G.deck.length > 0) {
        dealCards(G, ctx)
      }
    },

    endIf(G, ctx) {
      if (G.shouldReset) {
        return true;
      }

      // end turn if player has shouted or passed
      let p = G.playersKnownInfo[ctx.currentPlayer];
      if (ctx.phase === 'shouts') {
        return p.shout !== undefined || p.passed;
      } else {
        if (p.hasPlayedCard) {
          if (G.table.length < 4) {
            return true;
          } else {
            return { next: G.playerWithHighestCardOnTable };
          }
        }
      }
      return false;
    },

    onEnd(G, ctx) {
      if (G.shouldReset) {
        G.shouldReset = false;
      } else if (ctx.phase === 'shouts') {
        const allPlayersPassed = Object.keys(G.playersKnownInfo).filter(key => G.playersKnownInfo[key].passed).length === ctx.numPlayers;
        if (allPlayersPassed) {
          // new hands if everyone has passed
          Object.keys(G.players).forEach(key => {
            G.playersKnownInfo[key].passed = false;
            G.players[key].hand = [];
          });
          G.deck = initDeck();
        }
      }
      return G;
    },

    order: {
      // default behaviour: start with first player
      first: (G, ctx) => 0,
      // default behaviour: round robin
      next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
      playOrder: (G, ctx) => {
        if (ctx.turn > 0) {
          if (ctx.phase === 'shouts') {
            return [G.dealer,
              (G.dealer + 1) % ctx.numPlayers,
              (G.dealer + 2) % ctx.numPlayers,
              (G.dealer + 3) % ctx.numPlayers,];
          } else if (G.highestShoutingPlayer !== undefined) {
            return [G.highestShoutingPlayer,
              ((parseInt(G.highestShoutingPlayer) + 1) % ctx.numPlayers).toString(),
              ((parseInt(G.highestShoutingPlayer) + 2) % ctx.numPlayers).toString(),
              ((parseInt(G.highestShoutingPlayer) + 3) % ctx.numPlayers).toString()];
          } else if (G.playerWhoWonPreviousTrick !== undefined) {
            return [G.playerWhoWonPreviousTrick,
              ((parseInt(G.playerWhoWonPreviousTrick) + 1) % ctx.numPlayers).toString(),
              ((parseInt(G.playerWhoWonPreviousTrick) + 2) % ctx.numPlayers).toString(),
              ((parseInt(G.playerWhoWonPreviousTrick) + 3) % ctx.numPlayers).toString()];
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
        resetGame(G, ctx) {
          resetTheGame(G);
        },

        shout(G, ctx, value) {
          if (isLegalShoutValue(value) &&
              (G.highestShoutingPlayer === undefined || value > G.playersKnownInfo[G.highestShoutingPlayer].shout)) {
            // player has shouted the highest so far
            G.highestShoutingPlayer = ctx.currentPlayer;
            G.playersKnownInfo[ctx.currentPlayer].shout = value;
          } else {
            // player mad an illegal shout
            return INVALID_MOVE;
          }
        },

        pass(G, ctx) {
          // clear player's shout and pass turn
          G.playersKnownInfo[ctx.currentPlayer].passed = true;
          G.playersKnownInfo[ctx.currentPlayer].shout = undefined;
        },

        pandoer(G, ctx) {
          if (Object.keys(G.playersKnownInfo).filter(key => G.playersKnownInfo[key].shoutedPandoer).length === 0) {
            G.playersKnownInfo[ctx.currentPlayer].shoutedPandoer = true;
            G.highestShoutingPlayer = ctx.currentPlayer;
          } else {
            return INVALID_MOVE;
          }
        },

        pandoerOnTable(G, ctx) {
          if (Object.keys(G.playersKnownInfo).filter(key => G.playersKnownInfo[key].shoutedPandoerOnTable).length === 0) {
            G.playersKnownInfo[ctx.currentPlayer].shoutedPandoerOnTable = true;
            G.highestShoutingPlayer = ctx.currentPlayer;
          } else {
            return INVALID_MOVE;
          }
        },
      },

      endIf(G, ctx) {
        const allPlayersPassed = Object.keys(G.playersKnownInfo).filter(key => G.playersKnownInfo[key].passed).length === ctx.numPlayers;
        const allPlayersShoutedOrPassed = Object.keys(G.playersKnownInfo).filter(key => {
          return G.playersKnownInfo[key].shout === undefined &&
              !G.playersKnownInfo[key].passed &&
              !G.playersKnownInfo[key].shoutedPandoer &&
              !G.playersKnownInfo[key].shoutedPandoerOnTable
        }).length === 0;

        // end phase if all players have either shouted or passed (and not everyone has passed)
        return !allPlayersPassed && allPlayersShoutedOrPassed;
      },

      onEnd(G, ctx) {
        G.attackingTeam = getPlayerTeam(G.highestShoutingPlayer);
        G.roundShout = G.playersKnownInfo[G.highestShoutingPlayer].shout;
        G.dealer++;
        G.dealer %= ctx.numPlayers;
        return G;
      }
    },

    play: {
      next: 'play', // different play phases will follow each other
      moves: {
        resetGame(G, ctx) {
          resetTheGame(G);
        },

        playCard(G, ctx, card) {
          if (shouldAnnounce(G, ctx, ctx.currentPlayer)) {
            return INVALID_MOVE;
          }

          if (!containsCard(G.players[ctx.currentPlayer].hand, card)) {
            return INVALID_MOVE;
          }

          if (!isLegalPlay(G, ctx, card)) {
            return INVALID_MOVE;
          }

          // Set trump if it hasn't been set yet
          if (G.trump === undefined) {
            G.trump = card.suit;
          }

          G.playersKnownInfo[ctx.currentPlayer].hasPlayedCard = true;

          // remove card from player's deck
          G.players[ctx.currentPlayer].hand = removeCard(G.players[ctx.currentPlayer].hand, card);
          G.playersKnownInfo[ctx.currentPlayer].lastPlayedCard = card;

          // Check if card is new highest card on table
          if (G.highestCardOnTable === undefined || isCard1HigherThanCard2(G, card, G.highestCardOnTable)) {
            G.highestCardOnTable = card;
            G.playerWithHighestCardOnTable = ctx.currentPlayer;
          }

          // add card to table
          G.table.push(card);
        },

        addCardToAnnouncement(G, ctx, card) {
          if (shouldAnnounce(G, ctx, ctx.currentPlayer)) {
            if (containsCard(G.players[ctx.currentPlayer].hand, card)) {
              G.playersKnownInfo[ctx.currentPlayer].announcement.push(card);
              G.playersKnownInfo[ctx.currentPlayer].announcementScore = getAnnouncementScore(G.playersKnownInfo[ctx.currentPlayer].announcement, G.trump);
              G.players[ctx.currentPlayer].hand = removeCard(G.players[ctx.currentPlayer].hand, card);
            } else if (!G.playersKnownInfo[ctx.currentPlayer].lastPlayedCardInAnnouncement && areCardsEqual(G.playersKnownInfo[ctx.currentPlayer].lastPlayedCard, card)) {
              G.playersKnownInfo[ctx.currentPlayer].announcement.push(card);
              G.playersKnownInfo[ctx.currentPlayer].announcementScore = getAnnouncementScore(G.playersKnownInfo[ctx.currentPlayer].announcement, G.trump);
              G.playersKnownInfo[ctx.currentPlayer].lastPlayedCardInAnnouncement = true;
            } else {
              return INVALID_MOVE;
            }
          } else {
            return INVALID_MOVE;
          }
        },

        removeCardFromAnnouncement(G, ctx, card) {
          if (shouldAnnounce(G, ctx, ctx.currentPlayer)) {
            G.playersKnownInfo[ctx.currentPlayer].announcement = removeCard(G.playersKnownInfo[ctx.currentPlayer].announcement, card);
            G.playersKnownInfo[ctx.currentPlayer].announcementScore = getAnnouncementScore(G.playersKnownInfo[ctx.currentPlayer].announcement, G.trump);

            if (G.playersKnownInfo[ctx.currentPlayer].lastPlayedCardInAnnouncement && areCardsEqual(G.playersKnownInfo[ctx.currentPlayer].lastPlayedCard, card)) {
              G.playersKnownInfo[ctx.currentPlayer].lastPlayedCardInAnnouncement = false;
            } else {
              G.players[ctx.currentPlayer].hand.push(card);
            }
            G.players[ctx.currentPlayer].hand = sortCards(G.players[ctx.currentPlayer].hand);
          } else {
            return INVALID_MOVE;
          }
        },

        announce(G, ctx) {
          if (shouldAnnounce(G, ctx, ctx.currentPlayer)) {
            G.playersKnownInfo[ctx.currentPlayer].hasAnnounced = true;
            G.roundScore[getPlayerTeam(ctx.currentPlayer)] += G.playersKnownInfo[ctx.currentPlayer].announcementScore;
            for (const card of G.playersKnownInfo[ctx.currentPlayer].announcement) {
              if (G.playersKnownInfo[ctx.currentPlayer].lastPlayedCardInAnnouncement && areCardsEqual(card, G.playersKnownInfo[ctx.currentPlayer].lastPlayedCard)) {
                G.playersKnownInfo[ctx.currentPlayer].lastPlayedCardInAnnouncement = false;
              } else {
                G.players[ctx.currentPlayer].hand.push(card);
              }
            }
            G.players[ctx.currentPlayer].hand = sortCards(G.players[ctx.currentPlayer].hand);
            G.lastAnnouncingPlayer = ctx.currentPlayer;
          } else {
            return INVALID_MOVE;
          }
        },

        resign(G, ctx) {
          G.resigningPlayer = ctx.currentPlayer;
        },
      },

      onBegin(G, ctx) {
        G.playerWithHighestCardOnTable = undefined;
      },

      endIf(G, ctx) {
        // end phase if four cards are on the table
        return G.table.length === 4 || G.resigningPlayer !== undefined;
      },

      onEnd(G, ctx) {
        if (G.playPhaseEnded) {
          G.playPhaseEnded = false;
          return G;
        }

        // No need to count store if someone has resigned
        if (G.resigningPlayer !== undefined) {
          // Clear hands if someone has resigned
          Object.keys(G.players).forEach(k => {
            G.players[k].hand = [];
          })
        } else {
          let winningTeam = getPlayerTeam(G.playerWithHighestCardOnTable);

          // Add score to winning team
          G.roundScore[winningTeam] += getCardsScore(G.trump, G.table);

          // Add tricks from table to winning team
          G.tricks[winningTeam].push(G.table);
          G.lastTrick = G.table;
        }

        // Clear table
        G.table = [];

        // Clear play info
        G.highestCardOnTable = undefined;
        G.playerWhoWonPreviousTrick = G.playerWithHighestCardOnTable;
        G.playerWithHighestCardOnTable = undefined;

        for (const key of Object.keys(G.playersKnownInfo)) {
          G.playersKnownInfo[key].hasPlayedCard = false;
          // Clear shouts (does not happen after shout phase because we need this info in the play phase)
          G.playersKnownInfo[key].shout = undefined;
          G.playersKnownInfo[key].passed = false;
        }
        G.highestShoutingPlayer = undefined;
        G.lastAnnouncingPlayer = undefined;

        // No player has any cards left, it's the end of the round, count score.
        if (G.players[0].hand.length === 0) {
          const otherTeam = G.attackingTeam === 0 ? 1 : 0;
          const score = ~~(G.roundShout / 50);

          let attackingTeamWon = G.roundScore[G.attackingTeam] > G.roundScore[otherTeam];

          if (G.resigningPlayer !== undefined) {
            const resigningTeam = getPlayerTeam(G.resigningPlayer);
            attackingTeamWon = resigningTeam !== G.attackingTeam;
          }

          if (attackingTeamWon) {
            G.scoreBoard[G.attackingTeam] -= score;
          } else {
            // attacking team lost ('binnen')
            G.scoreBoard[G.attackingTeam] -= score;
            G.scoreBoard[otherTeam] += score;
          }

          // Cleanup
          G.trump = undefined;
          G.attackingTeam = undefined;
          G.roundScore = [0, 0];
          G.roundShout = 0;
          G.playerWhoWonPreviousTrick = undefined;
          G.tricks[0] = [];
          G.tricks[1] = [];
          G.lastTrick = [];
          G.resigningPlayer = undefined;
          for (const key of Object.keys(G.playersKnownInfo)) {
            G.playersKnownInfo[key].hasAnnounced = false;
            G.playersKnownInfo[key].announcement = [];
            G.playersKnownInfo[key].announcementScore = 0;
            G.playersKnownInfo[key].lastPlayedCard = undefined;
            G.playersKnownInfo[key].lastPlayedCardInAnnouncement = false;
          }

          // initiate deck again so that it can be dealt the beginning of the next turn
          G.deck = initDeck();
          G.playPhaseEnded = true;
          ctx.events.setPhase('shouts');
        }

        return G;
      },
    },
  },
};

export { Pandoer, getCardScore, getCardsScore, getAnnouncementScore, shouldAnnounce, isLegalPlay, getPlayerId }
