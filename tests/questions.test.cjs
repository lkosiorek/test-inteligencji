const test = require('node:test');
const assert = require('node:assert/strict');
const { QUESTIONS, CATEGORIES } = require('../questions.js');
test('pula zawiera 50 jednoznacznie zidentyfikowanych pytań i po 10 na kategorię', () => {
  assert.equal(QUESTIONS.length, 50);
  assert.equal(new Set(QUESTIONS.map(q=>q.id)).size, 50);
  for(let c=0;c<CATEGORIES.length;c++) assert.equal(QUESTIONS.filter(q=>q.category===c).length, 10);
});
test('każde pytanie ma cztery różne opcje, poprawny klucz i wyjaśnienie', () => {
  for(const q of QUESTIONS){
    assert.equal(q.options.length,4,q.text);
    assert.equal(new Set(q.options).size,4,q.text);
    assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4,q.text);
    assert.ok(q.text.length>10&&q.explanation.length>20,q.text);
  }
});
test('pytania graficzne mają sekwencję, cztery wzorce odpowiedzi i poprawny klucz', () => {
  const visual = QUESTIONS.filter(q=>q.patterns);
  assert.equal(visual.length, 6);
  for(const q of visual){
    assert.ok(q.sequence.length >= 4);
    assert.equal(q.patterns.length,4);
    assert.equal(new Set(q.patterns).size,4);
    assert.ok(q.patterns[q.correct]);
  }
});
