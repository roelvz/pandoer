import React from 'react';
import { render } from '@testing-library/react';
import { getCardScore, getCardsScore, getAnnouncementScore } from './game';

test('card scores', () => {
  expect(getCardScore('Hearts',{suit: 'Hearts', rank: 11})).toBe(20);
  expect(getCardScore('Hearts',{suit: 'Hearts', rank: 9})).toBe(14);
  expect(getCardScore('Hearts',{suit: 'Hearts', rank: 14})).toBe(11);
  expect(getCardScore('Hearts',{suit: 'Hearts', rank: 8})).toBe(0);

  let cards = [{suit: 'Clubs', rank: 11},
    {suit: 'Clubs', rank: 9},
    {suit: 'Clubs', rank: 14},
    {suit: 'Clubs', rank: 13},
    {suit: 'Clubs', rank: 12},
    {suit: 'Clubs', rank: 10},
    {suit: 'Clubs', rank: 8}];
  expect(getCardsScore('Clubs', cards)).toBe(60);
  expect(getCardsScore('Diamonds', cards)).toBe(27);

  cards = [{suit: 'Clubs', rank: 11},{suit: 'Clubs', rank: 11},
    {suit: 'Clubs', rank: 9},{suit: 'Clubs', rank: 9},
    {suit: 'Clubs', rank: 14},{suit: 'Clubs', rank: 14},
    {suit: 'Clubs', rank: 13},{suit: 'Clubs', rank: 13},
    {suit: 'Clubs', rank: 12},{suit: 'Clubs', rank: 12},
    {suit: 'Clubs', rank: 10},{suit: 'Clubs', rank: 10},
    {suit: 'Clubs', rank: 8},{suit: 'Clubs', rank: 8}];
  expect(getCardsScore('Clubs', cards)).toBe(120);
  expect(getCardsScore('Diamonds', cards)).toBe(54);
});

test('announcement scores', () => {
  // 4 Jacks = 200
  let cards = [{suit: 'Hearts', rank: 11}, {suit: 'Clubs', rank: 11}, {suit: 'Diamonds', rank: 11}, {suit: 'Spades', rank: 11}];
  expect(getAnnouncementScore(cards)).toBe(200);

  // 4 Queens = 100
  cards = [{suit: 'Hearts', rank: 12}, {suit: 'Clubs', rank: 12}, {suit: 'Diamonds', rank: 12}, {suit: 'Spades', rank: 12}];
  expect(getAnnouncementScore(cards)).toBe(100);

  // 4 Kings = 100
  cards = [{suit: 'Hearts', rank: 13}, {suit: 'Clubs', rank: 13}, {suit: 'Diamonds', rank: 13}, {suit: 'Spades', rank: 13}];
  expect(getAnnouncementScore(cards)).toBe(100);

  // 4 Aces = 100
  cards = [{suit: 'Hearts', rank: 14}, {suit: 'Clubs', rank: 14}, {suit: 'Diamonds', rank: 14}, {suit: 'Spades', rank: 14}];
  expect(getAnnouncementScore(cards)).toBe(100);

  // 4 Jacks and 4 Aces = 300
  cards = [{suit: 'Hearts', rank: 11}, {suit: 'Clubs', rank: 11}, {suit: 'Diamonds', rank: 11}, {suit: 'Spades', rank: 11},
           {suit: 'Hearts', rank: 14}, {suit: 'Clubs', rank: 14}, {suit: 'Diamonds', rank: 14}, {suit: 'Spades', rank: 14}];
  expect(getAnnouncementScore(cards)).toBe(300);

  // 5th of clubs with marriage
  cards = [{suit: 'Clubs', rank: 14}, {suit: 'Clubs', rank: 13}, {suit: 'Clubs', rank: 12}, {suit: 'Clubs', rank: 11}, {suit: 'Clubs', rank: 10}];
  expect(getAnnouncementScore(cards)).toBe(120);

  // 5th of hearts without marriage
  cards = [{suit: 'Hearts', rank: 12}, {suit: 'Hearts', rank: 11}, {suit: 'Hearts', rank: 10}, {suit: 'Hearts', rank: 9}, {suit: 'Hearts', rank: 8}];
  expect(getAnnouncementScore(cards)).toBe(100);

  // 4th of diamonds with marriage
  cards = [{suit: 'Diamonds', rank: 13}, {suit: 'Diamonds', rank: 12}, {suit: 'Diamonds', rank: 11}, {suit: 'Diamonds', rank: 10}];
  expect(getAnnouncementScore(cards)).toBe(70);

  // 4th of spades without marriage
  cards = [{suit: 'Spades', rank: 11}, {suit: 'Spades', rank: 10}, {suit: 'Spades', rank: 9}, {suit: 'Spades', rank: 8}];
  expect(getAnnouncementScore(cards)).toBe(50);

  // 3th of spades without marriage
  cards = [{suit: 'Spades', rank: 9}, {suit: 'Spades', rank: 10}, {suit: 'Spades', rank: 11}];
  expect(getAnnouncementScore(cards)).toBe(20);

  // 3th of spades with marriage
  cards = [{suit: 'Spades', rank: 11}, {suit: 'Spades', rank: 12}, {suit: 'Spades', rank: 13}];
  expect(getAnnouncementScore(cards)).toBe(40);

  // Marriage of spades
  cards = [{suit: 'Spades', rank: 12}, {suit: 'Spades', rank: 13}];
  expect(getAnnouncementScore(cards)).toBe(20);

  // Hand without score
  cards = [
    {suit: 'Spades', rank: 8}, {suit: 'Spades', rank: 9}, {suit: 'Spades', rank: 11}, {suit: 'Spades', rank: 13},
    {suit: 'Hearts', rank: 9}, {suit: 'Hearts', rank: 10}, {suit: 'Hearts', rank: 12}, {suit: 'Hearts', rank: 14},
    {suit: 'Clubs', rank: 8}, {suit: 'Clubs', rank: 10}, {suit: 'Clubs', rank: 13}, {suit: 'Clubs', rank: 14},
    {suit: 'Diamonds', rank: 9}, {suit: 'Diamonds', rank: 10}, {suit: 'Diamonds', rank: 13}, {suit: 'Diamonds', rank: 14},
  ];
  expect(getAnnouncementScore(cards)).toBe(0);

  // Third, fourth and fifth
  cards = [
    {suit: 'Spades', rank: 8}, {suit: 'Spades', rank: 9}, {suit: 'Spades', rank: 10}, {suit: 'Spades', rank: 13},
    {suit: 'Hearts', rank: 9}, {suit: 'Hearts', rank: 10}, {suit: 'Hearts', rank: 11}, {suit: 'Hearts', rank: 12}, {suit: 'Hearts', rank: 14},
    {suit: 'Clubs', rank: 9}, {suit: 'Clubs', rank: 10}, {suit: 'Clubs', rank: 11}, {suit: 'Clubs', rank: 12}, {suit: 'Clubs', rank: 13},
  ];
  expect(getAnnouncementScore(cards)).toBe(190);

  // Fifth + four queens
  cards = [
    {suit: 'Spades', rank: 12},
    {suit: 'Hearts', rank: 12},
    {suit: 'Diamonds', rank: 12},
    {suit: 'Clubs', rank: 9}, {suit: 'Clubs', rank: 10}, {suit: 'Clubs', rank: 11}, {suit: 'Clubs', rank: 12}, {suit: 'Clubs', rank: 13},
  ];
  expect(getAnnouncementScore(cards)).toBe(140);

  // Fifth + four kings (two times the same king)
  cards = [
    {suit: 'Spades', rank: 13},
    {suit: 'Hearts', rank: 13},
    {suit: 'Diamonds', rank: 13},
    {suit: 'Clubs', rank: 13},
    {suit: 'Clubs', rank: 9}, {suit: 'Clubs', rank: 10}, {suit: 'Clubs', rank: 11}, {suit: 'Clubs', rank: 12}, {suit: 'Clubs', rank: 13},
  ];
  expect(getAnnouncementScore(cards)).toBe(220);

  // Four queens, four kings
  cards = [
    {suit: 'Spades', rank: 12}, {suit: 'Spades', rank: 13},
    {suit: 'Hearts', rank: 12}, {suit: 'Hearts', rank: 13},
    {suit: 'Diamonds', rank: 12}, {suit: 'Diamonds', rank: 13},
    {suit: 'Clubs', rank: 12}, {suit: 'Clubs', rank: 13},
  ];
  expect(getAnnouncementScore(cards)).toBe(280);

  // Three queens, three kings
  cards = [
    {suit: 'Hearts', rank: 12}, {suit: 'Hearts', rank: 13},
    {suit: 'Diamonds', rank: 12}, {suit: 'Diamonds', rank: 13},
    {suit: 'Clubs', rank: 12}, {suit: 'Clubs', rank: 13},
  ];
  expect(getAnnouncementScore(cards)).toBe(60);

  // Eight jacks
  cards = [
    {suit: 'Hearts', rank: 11}, {suit: 'Clubs', rank: 11}, {suit: 'Diamonds', rank: 11}, {suit: 'Spades', rank: 11},
    {suit: 'Hearts', rank: 11}, {suit: 'Clubs', rank: 11}, {suit: 'Diamonds', rank: 11}, {suit: 'Spades', rank: 11},
  ];
  expect(getAnnouncementScore(cards)).toBe(400);

  // 6th of clubs (should count 5th, not two 3rds)
  cards = [{suit: 'Clubs', rank: 14}, {suit: 'Clubs', rank: 13}, {suit: 'Clubs', rank: 12}, {suit: 'Clubs', rank: 11}, {suit: 'Clubs', rank: 10}, {suit: 'Clubs', rank: 9}];
  expect(getAnnouncementScore(cards)).toBe(120);

  // 1 marriages of each suit
  cards = [
    {suit: 'Hearts', rank: 12}, {suit: 'Clubs', rank: 12}, {suit: 'Diamonds', rank: 12}, {suit: 'Spades', rank: 12},
    {suit: 'Hearts', rank: 13}, {suit: 'Clubs', rank: 13}, {suit: 'Diamonds', rank: 13}, {suit: 'Spades', rank: 13},
  ];
  expect(getAnnouncementScore(cards)).toBe(280);

  // 6 marriages, no 4 cads of the same suit
  cards = [
    {suit: 'Hearts', rank: 12}, {suit: 'Clubs', rank: 12}, {suit: 'Diamonds', rank: 12},
    {suit: 'Hearts', rank: 13}, {suit: 'Clubs', rank: 13}, {suit: 'Diamonds', rank: 13},
    {suit: 'Hearts', rank: 12}, {suit: 'Clubs', rank: 12}, {suit: 'Diamonds', rank: 12},
    {suit: 'Hearts', rank: 13}, {suit: 'Clubs', rank: 13}, {suit: 'Diamonds', rank: 13},
  ];
  expect(getAnnouncementScore(cards)).toBe(120);

  // A fifth and 4 queens
  cards = [
    {suit: 'Diamonds', rank: 12},
    {suit: 'Hearts', rank: 12},
    {suit: 'Spades', rank: 12},
    {suit: 'Clubs', rank: 10}, {suit: 'Clubs', rank: 11}, {suit: 'Clubs', rank: 12}, {suit: 'Clubs', rank: 13}, {suit: 'Clubs', rank: 14},
  ];
  expect(getAnnouncementScore(cards)).toBe(120);
});
