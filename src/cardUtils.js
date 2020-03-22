const Suits = ['hearths', 'diamonds', 'clubs', 'spades'];

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
  ctx.random.Shuffle(G.deck);
  // Deal the cards to the players
  let playerId = 0;
  for (const card of G.deck) {
    // deal card to player
    G.players[playerId].cards.push(card);
    playerId++;
    // cycle through players: 0, 1, 2, 3, 0, 1, 2, 3, ...
    playerId %= G.players.length;
  }
  // Deck is empty now
  G.deck = []
}

export { Suits, initDeck, dealCards}
