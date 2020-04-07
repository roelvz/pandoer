import { Suits, HEARTS, DIAMONDS, CLUBS, SPADES, initDeck, removeRanksForSuit, removeSuitsForRank } from "./cardUtils";

// TODO: namen van spelers
// TODO: pandoer (op tafel)
// TODO: non-random order
// TODO: validate announcement (niet teveel laten zien)
// TODO: bug: aantal slagen na ronde 1 staat op 1 (fix without workaround)
// TODO: AI

const startScore = 25; // both teams start at 25 on the scoreBoard (den boom)
const trumpRankOrder = [10,12,13,14,9,11];

function getPlayerTeam(G, player) {
  return player % 2 === 0 ? 0 : 1;
}

function isLegalShoutValue(value) {
  return value !== undefined && value >= 200 && value % 10 === 0;
}

function shouldShout(G, ctx, playerId) {
  return G.playersKnownInfo[playerId].passed === false && G.playersKnownInfo[playerId].shout === undefined
}

function someoneShoutedPandoer(G) {
  return Object.keys(G.playersKnownInfo).filter(k => G.playersKnownInfo[k].shoutedPandoer).length > 0;
}

function someoneShoutedPandoerOnTable(G) {
  return Object.keys(G.playersKnownInfo).filter(k => G.playersKnownInfo[k].shoutedPandoerOnTable).length > 0;
}

function canShout(G, ctx, value) {
  return isLegalShoutValue(value) &&
      !someoneShoutedPandoer(G) && !someoneShoutedPandoerOnTable(G) &&
      shouldShout(G, ctx, ctx.currentPlayer) &&
      (G.highestShoutingPlayer === undefined || value > G.playersKnownInfo[G.highestShoutingPlayer].shout);
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
  if (someoneShoutedPandoer(G) || someoneShoutedPandoerOnTable(G)) {
    return false;
  }
  const hasAnnounced = G.playersKnownInfo[playerId].hasAnnounced;
  const isPartOfAttackingTeam = getPlayerTeam(G, playerId) === G.attackingTeam;
  const oneTrickHasBeenPlayed = G.tricks[0].length + G.tricks[1].length === 1;
  return (playerId === ctx.currentPlayer) && !hasAnnounced && isPartOfAttackingTeam && oneTrickHasBeenPlayed;
}

function getPlayerId(G, ctx) {
  return Object.keys(G.players)[0];
}

function getTeamMatePlayerId(playerId) {
  console.log(playerId);
  let result = undefined;
  switch (parseInt(playerId)) {
    case 0: result = 2; break;
    case 1: result = 3; break;
    case 2: result = 0; break;
    case 3: result = 1; break;
    default: break;
  }
  console.log('RESULT: ' + result);
  return result;
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
  G.roundResultHasBeenShown = false;
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

export { startScore, getCardScore, getCardsScore, getAnnouncementScore, shouldAnnounce, isLegalPlay, getPlayerId,
  getTeamMatePlayerId, isLegalShoutValue, isCard1HigherThanCard2, getPlayerTeam, resetTheGame, someoneShoutedPandoer,
  someoneShoutedPandoerOnTable, shouldShout, canShout }
