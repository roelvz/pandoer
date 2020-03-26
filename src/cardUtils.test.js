import React from 'react';
import { render } from '@testing-library/react';
import { removeCard, containsCard, containsCards, containsRanksForSuit, containsSuitsForRank, removeSuitsForRank, removeRanksForSuit } from './cardUtils';

test('deck contains card', () => {
  let cards = [{suit: 'Hearts', rank: 10}, {suit: 'Clubs', rank: 9}];
  expect(containsCard(cards, {suit: 'Hearts', rank: 10})).toBeTruthy();

  cards = [{suit: 'Hearts', rank: 10}, {suit: 'Clubs', rank: 9}, {suit: 'Hearts', rank: 10}];
  expect(containsCard(cards, {suit: 'Hearts', rank: 10})).toBeTruthy();

  cards = [{suit: 'Clubs', rank: 9}];
  expect(containsCard(cards, {suit: 'Hearts', rank: 10})).toBeFalsy();
});

test('deck contains cards', () => {
  let cards = [{suit: 'Hearts', rank: 10}, {suit: 'Clubs', rank: 9}, {suit: 'Hearts', rank: 10}];
  expect(containsCards(cards, [])).toBeTruthy();
  expect(containsCards(cards, [{suit: 'Hearts', rank: 10}])).toBeTruthy();
  expect(containsCards(cards, [{suit: 'Clubs', rank: 9}])).toBeTruthy();
  expect(containsCards(cards, [{suit: 'Hearts', rank: 10}, {suit: 'Clubs', rank: 9}])).toBeTruthy();
  expect(containsCards(cards, [{suit: 'Hearts', rank: 10}, {suit: 'Hearts', rank: 10}])).toBeTruthy();
  expect(containsCards(cards, [{suit: 'Hearts', rank: 10}, {suit: 'Clubs', rank: 9}, {suit: 'Hearts', rank: 10}])).toBeTruthy();
  expect(containsCards(cards, [{suit: 'Hearts', rank: 10}, {suit: 'Hearts', rank: 10}, {suit: 'Hearts', rank: 10}])).toBeFalsy();
  expect(containsCards(cards, [{suit: 'Spades', rank: 10}])).toBeFalsy();
  expect(containsCards(cards, [{suit: 'Hearts', rank: 8}])).toBeFalsy();
  expect(containsCards(cards, [{suit: 'Clubs', rank: 9}, {suit: 'Diamonds', rank: 8}])).toBeFalsy();
});

test('set of cards contains ranks for suit', () => {
  expect(containsRanksForSuit([{suit: 'Clubs', rank: 9}, {suit: 'Clubs', rank: 10}, {suit: 'Clubs', rank: 11}], 'Clubs', [9,10,11])).toBeTruthy();
  expect(containsRanksForSuit([{suit: 'Clubs', rank: 9}, {suit: 'Clubs', rank: 10}, {suit: 'Clubs', rank: 11}], 'Clubs', [8,9,10,11,12])).toBeFalsy();
});

test('set of cards contains suits for rank', () => {
  expect(containsSuitsForRank([
      {suit: 'Clubs', rank: 12},
      {suit: 'Hearts', rank: 12},
      {suit: 'Diamonds', rank: 12},
      {suit: 'Spades', rank: 12}], 12, ['Clubs','Hearts','Diamonds','Spades'])).toBeTruthy();
});

test('remove ranks for suit', () => {
  expect(removeRanksForSuit([
    {suit: 'Clubs', rank: 9},
    {suit: 'Clubs', rank: 10},
    {suit: 'Clubs', rank: 11}], 'Clubs', [9,10,11]).length).toBe(0);
  expect(removeRanksForSuit([
    {suit: 'Clubs', rank: 9},
    {suit: 'Clubs', rank: 10},
    {suit: 'Clubs', rank: 11}], 'Clubs', [8,9,10,11,12]).length).toBe(3);
});

test('remove suits for rank', () => {
  expect(removeSuitsForRank([
    {suit: 'Clubs', rank: 12},
    {suit: 'Hearts', rank: 12},
    {suit: 'Diamonds', rank: 12},
    {suit: 'Spades', rank: 12}], 12, ['Clubs','Hearts','Diamonds','Spades']).length).toBe(0);

  expect(removeSuitsForRank([
    {suit: 'Clubs', rank: 11},
    {suit: 'Hearts', rank: 11},
    {suit: 'Diamonds', rank: 11},
    {suit: 'Spades', rank: 11}], 12, ['Clubs','Hearts','Diamonds','Spades']).length).toBe(4);
});

test('remove card from deck', () => {
  let cards = [{suit: 'Hearts', rank: 10}, {suit: 'Clubs', rank: 9}, {suit: 'Hearts', rank: 10}];
  let result = removeCard(cards,{suit: 'Hearts', rank: 10});
  expect(result.length).toBe(2);
  expect(result[0].suit).toBe('Clubs');
  expect(result[0].rank).toBe(9);
  expect(result[1].suit).toBe('Hearts');
  expect(result[1].rank).toBe(10);

  result = removeCard(result,{suit: 'Hearts', rank: 10});
  expect(result.length).toBe(1);
  expect(result[0].suit).toBe('Clubs');
  expect(result[0].rank).toBe(9);
});
