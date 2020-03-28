const HEARTS = 'Hearts';
const DIAMONDS = 'Diamonds';
const CLUBS = 'Clubs';
const SPADES = 'Spades';
const Suits = [HEARTS, DIAMONDS, CLUBS, SPADES];
const defaultSuitOrder = [HEARTS, SPADES, DIAMONDS, CLUBS];

function initDeck(minRank = 8,
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
    playerId %= G.players.length;
  }
  for (const player of G.players) {
    player.hand = sortCards(player.hand);
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

function getCardUri(card) {
  let filename = '';
  switch (card.rank) {
    case 8: filename += '8'; break;
    case 9: filename += '9'; break;
    case 10: filename += '10'; break;
    case 11: filename += 'J'; break;
    case 12: filename += 'Q'; break;
    case 13: filename += 'K'; break;
    case 14: filename += 'A'; break;
    default: break;
  }
  filename += card.suit[0] + '.svg';

  return `https://unpkg.com/cardsJS/dist/cards/${filename}`;
}

function cidToCard(cid) {
  let suit = '';
  let rank = undefined;
  switch (cid[1]) {
    case 'H': suit = HEARTS; break;
    case 'D': suit = DIAMONDS; break;
    case 'C': suit = CLUBS; break;
    case 'S': suit = SPADES; break;
    default: break;
  }
  switch (cid[0]) {
    case '8': rank = 8; break;
    case '9': rank = 9; break;
    case '0': rank = 10; break;
    case 'J': rank = 11; break;
    case 'Q': rank = 12; break;
    case 'K': rank = 13; break;
    case 'A': rank = 14; break;
    default: break;
  }
  return {
    suit: suit,
    rank: rank,
  }
}

export { Suits, HEARTS, DIAMONDS, CLUBS, SPADES, initDeck, dealCards, cardToString, getCardUri, cidToCard, removeCard,
  containsCard, containsCards, containsRanksForSuit, containsSuitsForRank, removeSuitsForRank, removeRanksForSuit }
