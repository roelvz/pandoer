import React from 'react';
import { render } from '@testing-library/react';
import { HEARTS, DIAMONDS, CLUBS, SPADES } from './cardUtils';
import { getCardScore, getCardsScore, getAnnouncementScore } from './game';

test('card scores', () => {
  expect(getCardScore(HEARTS,{suit: HEARTS, rank: 11})).toBe(20);
  expect(getCardScore(HEARTS,{suit: HEARTS, rank: 9})).toBe(14);
  expect(getCardScore(HEARTS,{suit: HEARTS, rank: 14})).toBe(11);
  expect(getCardScore(HEARTS,{suit: HEARTS, rank: 8})).toBe(0);

  let cards = [{suit: CLUBS, rank: 11},
    {suit: CLUBS, rank: 9},
    {suit: CLUBS, rank: 14},
    {suit: CLUBS, rank: 13},
    {suit: CLUBS, rank: 12},
    {suit: CLUBS, rank: 10},
    {suit: CLUBS, rank: 8}];
  expect(getCardsScore(CLUBS, cards)).toBe(60);
  expect(getCardsScore(DIAMONDS, cards)).toBe(27);

  cards = [{suit: CLUBS, rank: 11},{suit: CLUBS, rank: 11},
    {suit: CLUBS, rank: 9},{suit: CLUBS, rank: 9},
    {suit: CLUBS, rank: 14},{suit: CLUBS, rank: 14},
    {suit: CLUBS, rank: 13},{suit: CLUBS, rank: 13},
    {suit: CLUBS, rank: 12},{suit: CLUBS, rank: 12},
    {suit: CLUBS, rank: 10},{suit: CLUBS, rank: 10},
    {suit: CLUBS, rank: 8},{suit: CLUBS, rank: 8}];
  expect(getCardsScore(CLUBS, cards)).toBe(120);
  expect(getCardsScore(DIAMONDS, cards)).toBe(54);
});

test('announcement scores', () => {
  // 4 Jacks = 200
  let cards = [{suit: HEARTS, rank: 11}, {suit: CLUBS, rank: 11}, {suit: DIAMONDS, rank: 11}, {suit: SPADES, rank: 11}];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(200);

  // 4 Queens = 100
  cards = [{suit: HEARTS, rank: 12}, {suit: CLUBS, rank: 12}, {suit: DIAMONDS, rank: 12}, {suit: SPADES, rank: 12}];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(100);

  // 4 Kings = 100
  cards = [{suit: HEARTS, rank: 13}, {suit: CLUBS, rank: 13}, {suit: DIAMONDS, rank: 13}, {suit: SPADES, rank: 13}];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(100);

  // 4 Aces = 100
  cards = [{suit: HEARTS, rank: 14}, {suit: CLUBS, rank: 14}, {suit: DIAMONDS, rank: 14}, {suit: SPADES, rank: 14}];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(100);

  // 4 Jacks and 4 Aces = 300
  cards = [{suit: HEARTS, rank: 11}, {suit: CLUBS, rank: 11}, {suit: DIAMONDS, rank: 11}, {suit: SPADES, rank: 11},
           {suit: HEARTS, rank: 14}, {suit: CLUBS, rank: 14}, {suit: DIAMONDS, rank: 14}, {suit: SPADES, rank: 14}];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(300);

  // 5th of clubs with marriage
  cards = [{suit: CLUBS, rank: 14}, {suit: CLUBS, rank: 13}, {suit: CLUBS, rank: 12}, {suit: CLUBS, rank: 11}, {suit: CLUBS, rank: 10}];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(120);

  // 5th of hearts without marriage
  cards = [{suit: HEARTS, rank: 12}, {suit: HEARTS, rank: 11}, {suit: HEARTS, rank: 10}, {suit: HEARTS, rank: 9}, {suit: HEARTS, rank: 8}];
  expect(getAnnouncementScore(cards, HEARTS)).toBe(100);

  // 4th of diamonds with marriage
  cards = [{suit: DIAMONDS, rank: 13}, {suit: DIAMONDS, rank: 12}, {suit: DIAMONDS, rank: 11}, {suit: DIAMONDS, rank: 10}];
  expect(getAnnouncementScore(cards, DIAMONDS)).toBe(70);

  // 4th of spades without marriage
  cards = [{suit: SPADES, rank: 11}, {suit: SPADES, rank: 10}, {suit: SPADES, rank: 9}, {suit: SPADES, rank: 8}];
  expect(getAnnouncementScore(cards, SPADES)).toBe(50);

  // 3th of spades without marriage
  cards = [{suit: SPADES, rank: 9}, {suit: SPADES, rank: 10}, {suit: SPADES, rank: 11}];
  expect(getAnnouncementScore(cards, SPADES)).toBe(20);

  // 3th of spades with marriage
  cards = [{suit: SPADES, rank: 11}, {suit: SPADES, rank: 12}, {suit: SPADES, rank: 13}];
  expect(getAnnouncementScore(cards, SPADES)).toBe(40);

  // Marriage of spades
  cards = [{suit: SPADES, rank: 12}, {suit: SPADES, rank: 13}];
  expect(getAnnouncementScore(cards, SPADES)).toBe(20);

  // Hand without score
  cards = [
    {suit: SPADES, rank: 8}, {suit: SPADES, rank: 9}, {suit: SPADES, rank: 11}, {suit: SPADES, rank: 13},
    {suit: HEARTS, rank: 9}, {suit: HEARTS, rank: 10}, {suit: HEARTS, rank: 12}, {suit: HEARTS, rank: 14},
    {suit: CLUBS, rank: 8}, {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 13}, {suit: CLUBS, rank: 14},
    {suit: DIAMONDS, rank: 9}, {suit: DIAMONDS, rank: 10}, {suit: DIAMONDS, rank: 13}, {suit: DIAMONDS, rank: 14},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(0);

  // Third, fourth and fifth
  cards = [
    {suit: SPADES, rank: 8}, {suit: SPADES, rank: 9}, {suit: SPADES, rank: 10}, {suit: SPADES, rank: 13},
    {suit: HEARTS, rank: 9}, {suit: HEARTS, rank: 10}, {suit: HEARTS, rank: 11}, {suit: HEARTS, rank: 12}, {suit: HEARTS, rank: 14},
    {suit: CLUBS, rank: 9}, {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 11}, {suit: CLUBS, rank: 12}, {suit: CLUBS, rank: 13},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(190);

  // Fifth + four queens
  cards = [
    {suit: SPADES, rank: 12},
    {suit: HEARTS, rank: 12},
    {suit: DIAMONDS, rank: 12},
    {suit: CLUBS, rank: 9}, {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 11}, {suit: CLUBS, rank: 12}, {suit: CLUBS, rank: 13},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(140);

  // Fifth + four kings (two times the same king)
  cards = [
    {suit: SPADES, rank: 13},
    {suit: HEARTS, rank: 13},
    {suit: DIAMONDS, rank: 13},
    {suit: CLUBS, rank: 13},
    {suit: CLUBS, rank: 9}, {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 11}, {suit: CLUBS, rank: 12}, {suit: CLUBS, rank: 13},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(220);

  // Four queens, four kings
  cards = [
    {suit: SPADES, rank: 12}, {suit: SPADES, rank: 13},
    {suit: HEARTS, rank: 12}, {suit: HEARTS, rank: 13},
    {suit: DIAMONDS, rank: 12}, {suit: DIAMONDS, rank: 13},
    {suit: CLUBS, rank: 12}, {suit: CLUBS, rank: 13},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(220);

  // Three queens, three kings
  cards = [
    {suit: HEARTS, rank: 12}, {suit: HEARTS, rank: 13},
    {suit: DIAMONDS, rank: 12}, {suit: DIAMONDS, rank: 13},
    {suit: CLUBS, rank: 12}, {suit: CLUBS, rank: 13},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(20);

  // Eight jacks
  cards = [
    {suit: HEARTS, rank: 11}, {suit: CLUBS, rank: 11}, {suit: DIAMONDS, rank: 11}, {suit: SPADES, rank: 11},
    {suit: HEARTS, rank: 11}, {suit: CLUBS, rank: 11}, {suit: DIAMONDS, rank: 11}, {suit: SPADES, rank: 11},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(400);

  // 6th of clubs (should count 5th, not two 3rds)
  cards = [{suit: CLUBS, rank: 14}, {suit: CLUBS, rank: 13}, {suit: CLUBS, rank: 12}, {suit: CLUBS, rank: 11}, {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 9}];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(120);

  // 6 times marriage, no 4 cads of the same suit
  cards = [
    {suit: HEARTS, rank: 12}, {suit: CLUBS, rank: 12}, {suit: DIAMONDS, rank: 12},
    {suit: HEARTS, rank: 13}, {suit: CLUBS, rank: 13}, {suit: DIAMONDS, rank: 13},
    {suit: HEARTS, rank: 12}, {suit: CLUBS, rank: 12}, {suit: DIAMONDS, rank: 12},
    {suit: HEARTS, rank: 13}, {suit: CLUBS, rank: 13}, {suit: DIAMONDS, rank: 13},
  ];
  expect(getAnnouncementScore(cards, HEARTS)).toBe(40);

  // A fifth and 4 queens
  cards = [
    {suit: DIAMONDS, rank: 12},
    {suit: HEARTS, rank: 12},
    {suit: SPADES, rank: 12},
    {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 11}, {suit: CLUBS, rank: 12}, {suit: CLUBS, rank: 13}, {suit: CLUBS, rank: 14},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(120);

  cards = [
    {suit: CLUBS, rank: 9}, {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 11},
    {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 11}, {suit: CLUBS, rank: 12},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(50);

  cards = [
    {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 11}, {suit: CLUBS, rank: 12}, {suit: CLUBS, rank: 13}, {suit: CLUBS, rank: 14},
    {suit: DIAMONDS, rank: 13},
    {suit: SPADES, rank: 13},
    {suit: HEARTS, rank: 12}, {suit: HEARTS, rank: 13}, {suit: HEARTS, rank: 14},
  ];
  expect(getAnnouncementScore(cards, CLUBS)).toBe(140);
  expect(getAnnouncementScore(cards, HEARTS)).toBe(140);
  expect(getAnnouncementScore(cards, SPADES)).toBe(120);
});
