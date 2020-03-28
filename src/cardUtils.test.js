import React from 'react';
import { render } from '@testing-library/react';
import {
  HEARTS,
  DIAMONDS,
  CLUBS,
  SPADES,
  removeCard,
  containsCard,
  containsCards,
  containsRanksForSuit,
  containsSuitsForRank,
  removeSuitsForRank,
  removeRanksForSuit
} from './cardUtils';

test('deck contains card', () => {
  let cards = [{suit: HEARTS, rank: 10}, {suit: CLUBS, rank: 9}];
  expect(containsCard(cards, {suit: HEARTS, rank: 10})).toBeTruthy();

  cards = [{suit: HEARTS, rank: 10}, {suit: CLUBS, rank: 9}, {suit: HEARTS, rank: 10}];
  expect(containsCard(cards, {suit: HEARTS, rank: 10})).toBeTruthy();

  cards = [{suit: CLUBS, rank: 9}];
  expect(containsCard(cards, {suit: HEARTS, rank: 10})).toBeFalsy();
});

test('deck contains cards', () => {
  let cards = [{suit: HEARTS, rank: 10}, {suit: CLUBS, rank: 9}, {suit: HEARTS, rank: 10}];
  expect(containsCards(cards, [])).toBeTruthy();
  expect(containsCards(cards, [{suit: HEARTS, rank: 10}])).toBeTruthy();
  expect(containsCards(cards, [{suit: CLUBS, rank: 9}])).toBeTruthy();
  expect(containsCards(cards, [{suit: HEARTS, rank: 10}, {suit: CLUBS, rank: 9}])).toBeTruthy();
  expect(containsCards(cards, [{suit: HEARTS, rank: 10}, {suit: HEARTS, rank: 10}])).toBeTruthy();
  expect(containsCards(cards, [{suit: HEARTS, rank: 10}, {suit: CLUBS, rank: 9}, {suit: HEARTS, rank: 10}])).toBeTruthy();
  expect(containsCards(cards, [{suit: HEARTS, rank: 10}, {suit: HEARTS, rank: 10}, {suit: HEARTS, rank: 10}])).toBeFalsy();
  expect(containsCards(cards, [{suit: SPADES, rank: 10}])).toBeFalsy();
  expect(containsCards(cards, [{suit: HEARTS, rank: 8}])).toBeFalsy();
  expect(containsCards(cards, [{suit: CLUBS, rank: 9}, {suit: DIAMONDS, rank: 8}])).toBeFalsy();
});

test('set of cards contains ranks for suit', () => {
  expect(containsRanksForSuit([{suit: CLUBS, rank: 9}, {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 11}], CLUBS, [9,10,11])).toBeTruthy();
  expect(containsRanksForSuit([{suit: CLUBS, rank: 9}, {suit: CLUBS, rank: 10}, {suit: CLUBS, rank: 11}], CLUBS, [8,9,10,11,12])).toBeFalsy();
});

test('set of cards contains suits for rank', () => {
  expect(containsSuitsForRank([
      {suit: CLUBS, rank: 12},
      {suit: HEARTS, rank: 12},
      {suit: DIAMONDS, rank: 12},
      {suit: SPADES, rank: 12}], 12, [CLUBS,HEARTS,DIAMONDS,SPADES])).toBeTruthy();
});

test('remove ranks for suit', () => {
  expect(removeRanksForSuit([
    {suit: CLUBS, rank: 9},
    {suit: CLUBS, rank: 10},
    {suit: CLUBS, rank: 11}], CLUBS, [9,10,11]).length).toBe(0);
  expect(removeRanksForSuit([
    {suit: CLUBS, rank: 9},
    {suit: CLUBS, rank: 10},
    {suit: CLUBS, rank: 11}], CLUBS, [8,9,10,11,12]).length).toBe(3);
});

test('remove suits for rank', () => {
  expect(removeSuitsForRank([
    {suit: CLUBS, rank: 12},
    {suit: HEARTS, rank: 12},
    {suit: DIAMONDS, rank: 12},
    {suit: SPADES, rank: 12}], 12, [CLUBS,HEARTS,DIAMONDS,SPADES]).length).toBe(0);

  expect(removeSuitsForRank([
    {suit: CLUBS, rank: 11},
    {suit: HEARTS, rank: 11},
    {suit: DIAMONDS, rank: 11},
    {suit: SPADES, rank: 11}], 12, [CLUBS,HEARTS,DIAMONDS,SPADES]).length).toBe(4);
});

test('remove card from deck', () => {
  let cards = [{suit: HEARTS, rank: 10}, {suit: CLUBS, rank: 9}, {suit: HEARTS, rank: 10}];
  let result = removeCard(cards,{suit: HEARTS, rank: 10});
  expect(result.length).toBe(2);
  expect(result[0].suit).toBe(CLUBS);
  expect(result[0].rank).toBe(9);
  expect(result[1].suit).toBe(HEARTS);
  expect(result[1].rank).toBe(10);

  result = removeCard(result,{suit: HEARTS, rank: 10});
  expect(result.length).toBe(1);
  expect(result[0].suit).toBe(CLUBS);
  expect(result[0].rank).toBe(9);
});
