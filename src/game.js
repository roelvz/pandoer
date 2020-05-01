import { INVALID_MOVE } from 'boardgame.io/core';
import { startScore, resetTheGame,  shouldAnnounce, isLegalPlay, getAnnouncementScore, isCard1HigherThanCard2,
  getPlayerTeam, getCardsScore, someoneShoutedPandoer, someoneShoutedPandoerOnTable, canShout } from "./pandoerRules";
import { initDeck, dealCards, containsCard, removeCard, areCardsEqual, sortCards } from "./cardUtils";

// TODO: show win/lose on end of game
// TODO: restart at end of game
// TODO: pandoer (op tafel): end if higher card is played
// TODO: preselect
// TODO: resign on other player's turn
// TODO: accept resign

function createPandoerGame(playerView) {
  return {
    setup: () => ({
      // The overall scoreboard (den boom)
      scoreBoard: [startScore, startScore],
      deck: initDeck(),
      // Represents all cards on the table
      table: [],
      // Set in Pandoer (on table) was lost
      pandoerLost: false,
      countedScores: false,

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
          hasAcceptedResult: false,
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
          hasAcceptedResult: false,
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
          hasAcceptedResult: false,
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
          hasAcceptedResult: false,
        },
      },
      shouldReset: false,
    }),

    playerView: playerView ? playerView : (G, ctx, playerID) => { return G },

    endIf(G, ctx) {
      return G.countedScores && (G.scoreBoard[0] <= 0 || G.scoreBoard[1] <= 0);
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
          let result = ctx.playOrder;
          if (ctx.turn > 0) {
            if (ctx.phase === 'shouts') {
              result = [G.dealer,
                (G.dealer + 1) % ctx.numPlayers,
                (G.dealer + 2) % ctx.numPlayers,
                (G.dealer + 3) % ctx.numPlayers,];
            } else if (G.playerWhoWonPreviousTrick !== undefined) {
              result = [G.playerWhoWonPreviousTrick,
                ((parseInt(G.playerWhoWonPreviousTrick) + 1) % ctx.numPlayers).toString(),
                ((parseInt(G.playerWhoWonPreviousTrick) + 2) % ctx.numPlayers).toString(),
                ((parseInt(G.playerWhoWonPreviousTrick) + 3) % ctx.numPlayers).toString()];
            } else if (G.highestShoutingPlayer !== undefined) {
              result = [G.highestShoutingPlayer,
                ((parseInt(G.highestShoutingPlayer) + 1) % ctx.numPlayers).toString(),
                ((parseInt(G.highestShoutingPlayer) + 2) % ctx.numPlayers).toString(),
                ((parseInt(G.highestShoutingPlayer) + 3) % ctx.numPlayers).toString()];
            }
          }
          return result;
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
            if (canShout(G, ctx, value)) {
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
            if (!someoneShoutedPandoer(G)) {
              G.playersKnownInfo[ctx.currentPlayer].shout = 500;
              G.playersKnownInfo[ctx.currentPlayer].shoutedPandoer = true;
              G.highestShoutingPlayer = ctx.currentPlayer;
            } else {
              return INVALID_MOVE;
            }
          },

          pandoerOnTable(G, ctx) {
            if (!someoneShoutedPandoerOnTable(G)) {
              G.playersKnownInfo[ctx.currentPlayer].shout = 500;
              G.playersKnownInfo[ctx.currentPlayer].shoutedPandoerOnTable = true;
              G.highestShoutingPlayer = ctx.currentPlayer;

              Object.keys(G.playersKnownInfo).forEach(key => {
                const player = G.playersKnownInfo[key];
                if (player.shout === undefined && !player.passed) {
                  player.passed = true;
                }
              });
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
          G.attackingTeam = getPlayerTeam(G, G.highestShoutingPlayer);
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
              G.roundScore[getPlayerTeam(G, ctx.currentPlayer)] += G.playersKnownInfo[ctx.currentPlayer].announcementScore;
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
          let result = G.table.length === 4 || G.resigningPlayer !== undefined;
          return result;
        },

        onEnd(G, ctx) {
          if (G.playPhaseEnded) {
            G.playPhaseEnded = false;
            return G;
          }

          let winningTeam = getPlayerTeam(G, G.playerWithHighestCardOnTable);

          // Pandoer game is lost from the moment one trick is lost
          if (someoneShoutedPandoer(G) || someoneShoutedPandoerOnTable(G)) {
            if (G.playerWithHighestCardOnTable !== G.highestShoutingPlayer) {
              // Pandoer lost!
              G.pandoerLost = true;
            }
          }

          // No need to count store if someone has resigned
          if (G.resigningPlayer !== undefined) {
            // Clear hands if someone has resigned
            Object.keys(G.players).forEach(k => {
              G.players[k].hand = [];
            })
          } else {
            if (!G.pandoerLost) {
              // Add score to winning team
              G.roundScore[winningTeam] += getCardsScore(G.trump, G.table);

              // Add tricks from table to winning team
              G.tricks[winningTeam].push(G.table);
            } else {
              const otherTeam = G.attackingTeam === 0 ? 1 : 0;
              G.tricks[otherTeam].push(G.table);
            }
            G.lastTrick = G.table;
          }

          // Clear table
          G.table = [];

          // Clear play info
          G.highestCardOnTable = undefined;
          for (const key of Object.keys(G.playersKnownInfo)) {
            G.playersKnownInfo[key].hasPlayedCard = false;
          }
          G.lastAnnouncingPlayer = undefined;
          G.playerWhoWonPreviousTrick = G.playerWithHighestCardOnTable;
          G.playerWithHighestCardOnTable = undefined;

          // No player has any cards left, it's the end of the round, count score.
          if (G.players[0].hand.length === 0 || G.pandoerLost) {
            const otherTeam = G.attackingTeam === 0 ? 1 : 0;
            let score = ~~(G.roundShout / 50);
            if (someoneShoutedPandoer(G)) {
              score = 10;
            } else if (someoneShoutedPandoerOnTable(G)) {
              // Score to 0 in case of Pandoer on table
              score = G.scoreBoard[G.pandoerLost ? otherTeam : G.attackingTeam];
            }

            let announcementScore = G.attackingTeam === 0 ?
                G.playersKnownInfo[0].announcementScore + G.playersKnownInfo[2].announcementScore :
                G.playersKnownInfo[1].announcementScore + G.playersKnownInfo[3].announcementScore
            let attackingTeamWon = !G.pandoerLost && G.roundScore[G.attackingTeam] + announcementScore - G.roundShout > G.roundScore[otherTeam];

            if (G.resigningPlayer !== undefined) {
              const resigningTeam = getPlayerTeam(G, G.resigningPlayer);
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
            G.roundShout = 0;
            G.playerWhoWonPreviousTrick = undefined;
            G.lastTrick = [];
            G.resigningPlayer = undefined;
            for (const key of Object.keys(G.playersKnownInfo)) {
              G.playersKnownInfo[key].hasAnnounced = false;
              G.playersKnownInfo[key].announcement = [];
              G.playersKnownInfo[key].lastPlayedCard = undefined;
              G.playersKnownInfo[key].lastPlayedCardInAnnouncement = false;
            }

            G.playPhaseEnded = true;

            G.countedScores = false;
            ctx.events.setPhase('countPoints');
          }

          return G;
        },
      },
      countPoints: {
        next: 'shouts',

        onBegin(G, ctx) {
          ctx.events.setActivePlayers({all: 'accept'});
        },

        endIf(G, ctx) {
          return Object.keys(G.playersKnownInfo).filter(key => G.playersKnownInfo[key].hasAcceptedResult).length === ctx.numPlayers;
        },

        onEnd(G, ctx) {
          Object.keys(G.playersKnownInfo).forEach(key => {
            G.playersKnownInfo[key].hasAcceptedResult = false;
            G.playersKnownInfo[key].announcementScore = 0;
            G.playersKnownInfo[key].shout = undefined;
            G.playersKnownInfo[key].passed = false;
            G.playersKnownInfo[key].shoutedPandoer = false;
            G.playersKnownInfo[key].shoutedPandoerOnTable = false;
            // Necessary in case of a lost pandoer
            G.players[key].hand = [];
          });
          G.highestShoutingPlayer = undefined;
          G.attackingTeam = undefined;
          G.roundScore = [0, 0];
          G.tricks[0] = [];
          G.tricks[1] = [];
          // initiate deck again so that it can be dealt the beginning of the next turn
          G.deck = initDeck();
          G.countedScores = true;
        },

        turn: {
          stages: {
            accept: {
              moves: {
                acceptResult(G, ctx, playerId) {
                  G.playersKnownInfo[playerId].hasAcceptedResult = true;
                },
              },
            },
          },
        },
      },
    },
  };

}


export { createPandoerGame }
