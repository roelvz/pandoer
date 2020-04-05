const HEARTS = 'Hearts';
const DIAMONDS = 'Diamonds';
const CLUBS = 'Clubs';
const SPADES = 'Spades';
const Suits = [HEARTS, DIAMONDS, CLUBS, SPADES];
const defaultSuitOrder = [HEARTS, SPADES, DIAMONDS, CLUBS];

function initDeck(minRank = 9,
                  maxRank = 14, // Ace = 14, for ease of rank comparisons
                  deckMultiplier = 2) { // default dobbelen boek :-)
  let result = [];
  for (let i = 0; i < deckMultiplier; i++) {
    for (const suit of Suits) {
      for (let rank = minRank; rank <= maxRank; rank++) {
        // Add card to deck
        result.push({
          suit: suit,
          rank: rank
        })
      }
    }
  }
  return result;
}

function dealCards(G, ctx) {
  // Shuffle the deck
  G.deck = ctx.random.Shuffle(G.deck);
  // Deal the cards to the players
  let playerId = 0;
  for (const card of G.deck) {
    // deal card to player
    G.players[playerId].hand.push(card);
    playerId++;
    // cycle through players: 0, 1, 2, 3, 0, 1, 2, 3, ...
    playerId %= ctx.numPlayers;
  }
  for (const key of Object.keys(G.players)) {
    G.players[key].hand = sortCards(G.players[key].hand);
  }

  // Deck is empty now
  G.deck = []
}

function compareSuits(suit1, suit2, suitOrder) {
  const order1 = suitOrder.indexOf(suit1);
  const order2 = suitOrder.indexOf(suit2);
  if (order1 === order2) {
    return 0;
  } else if (order1 > order2) {
    return 1;
  } else {
    return -1;
  }
}

function areCardsEqual(card1, card2) {
  return card1.suit === card2.suit && card1.rank === card2.rank;
}

function sortCards(cards) {
  return cards.sort((c1, c2) => {
    let suitOrder = defaultSuitOrder;

    const noSpades = cards.filter(c => c.suit === SPADES).length === 0;
    if (noSpades) {
      suitOrder = [HEARTS, CLUBS, DIAMONDS];
    } else {
      const noDiamonds = cards.filter(c => c.suit === DIAMONDS).length === 0;
      if (noDiamonds) {
        suitOrder = [SPADES, HEARTS, CLUBS];
      }
    }

    const suitComp = compareSuits(c1.suit, c2.suit, suitOrder);
    if (suitComp === 0) {
      if (c1.rank === c2.rank) {
        return 0;
      } else if (c1.rank < c2.rank) {
        return 1;
      } else {
        return -1;
      }
    } else {
      return suitComp;
    }
  });
}

function containsCard(deck, card) {
  return removeCard(deck, card).length === deck.length - 1;
}

function containsCards(deck, cards) {
  let cardsLeft = deck;
  for (const card of cards) {
    if (!containsCard(cardsLeft, card)) {
      return false;
    }
    cardsLeft = removeCard(cardsLeft, card);
  }
  return true;
}

function containsRanksForSuit(cards, suit, ranks) {
  for (const rank of ranks) {
    if (!containsCard(cards, {suit, rank})) {
      return false;
    }
  }
  return true;
}

// Removes all cards with the given rank and the given suits, only if the cards list contains all of them
function removeRanksForSuit(cards, suit, ranks) {
  let result = cards;
  if (containsRanksForSuit(cards, suit, ranks)) {
    for (const rank of ranks) {
      result = removeCard(result, {rank, suit});
    }
  }
  return result;
}

// Removes all cards with the given suits and the given ranks, only if the cards list contains all of them
function containsSuitsForRank(cards, rank, suits) {
  for (const suit of suits) {
    if (!containsCard(cards, {suit, rank})) {
      return false;
    }
  }
  return true;
}

function removeSuitsForRank(cards, rank, suits) {
  let result = cards;
  if (containsSuitsForRank(cards, rank, suits)) {
    for (const suit of suits) {
      result = removeCard(result, {rank, suit});
    }
  }
  return result;
}

function removeCard(cards, card) {
  let result = [];
  let found = false;
  for (const c of cards) {
    if (!found && c.rank === card.rank && c.suit === card.suit) {
      found = true;
    } else {
      result.push(c);
    }
  }
  return result;
}

function rankToString(rank) {
  switch (rank) {
    case 8: return 'Eight';
    case 9: return 'Nine';
    case 10: return 'Ten';
    case 11: return 'Jack';
    case 12: return 'Queen';
    case 13: return 'King';
    case 14: return 'Ace';
    default: return 'Unknown card';
  }
}

function cardToString(card) {
  if (card) {
    return `${rankToString(card.rank)} of ${card.suit}`;
  }
  return '';
}

function cardToCid(card) {
  let cid = '';
  switch (card.rank) {
    case 14: cid += '1'; break;
    case 13: cid += 'k'; break;
    case 12: cid += 'q'; break;
    case 11: cid += 'j'; break;
    default: cid += card.rank; break;
  }
  switch (card.suit) {
    case HEARTS: cid += 'h'; break;
    case CLUBS: cid += 'c'; break;
    case DIAMONDS: cid += 'd'; break;
    case SPADES: cid += 's'; break;
    default: break;
  }
  return cid;
}

function cardsToCid(cards) {
  return cards.map(card => cardToCid(card));
}

function cidToCard(cid) {
  let suit = '';
  let rank = undefined;

  if (cid.length === 3) {
    // 10 is a special case
    rank = 10;
  } else {
    switch (cid[0]) {
      case 'j': rank = 11; break;
      case 'q': rank = 12; break;
      case 'k': rank = 13; break;
      case '1': rank = 14; break;
      default: rank = parseInt(cid[0]); break;
    }
  }

  const switchCid = cid.length === 3 ? cid[2] : cid[1];
  switch (switchCid) {
    case 'h': suit = HEARTS; break;
    case 'd': suit = DIAMONDS; break;
    case 'c': suit = CLUBS; break;
    case 's': suit = SPADES; break;
    default: break;
  }

  return { suit, rank };
}

function suitInDutch(suit) {
  switch (suit) {
    case HEARTS: return 'Harten';
    case CLUBS: return 'Klaveren';
    case DIAMONDS: return 'Ruiten';
    case SPADES: return 'Schoppen';
    default: return '';
  }
}

export { Suits, HEARTS, DIAMONDS, CLUBS, SPADES, initDeck, dealCards, cardToString, cidToCard, removeCard,
  containsCard, containsCards, containsRanksForSuit, containsSuitsForRank, removeSuitsForRank, removeRanksForSuit,
  cardToCid, cardsToCid, sortCards, areCardsEqual, suitInDutch }
