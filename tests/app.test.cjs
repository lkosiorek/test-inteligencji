const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const questionsSource = fs.readFileSync(path.join(__dirname, '../questions.js'), 'utf8');
const appSource = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const { QUESTIONS, LEGACY_QUESTIONS } = require('../questions.js');

// Minimalny DOM sprawdza logikę i wygenerowany HTML, nie wygląd w przeglądarce.
function setup(saved = {}) {
  const elements = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      innerHTML: '', focus() {}, close() { this.open = false; }, showModal() { this.open = true; }
    });
    return elements.get(selector);
  };
  const create = new Function('document', 'location', 'localStorage', 'window', 'setInterval',
    questionsSource + '\n' + appSource + '\nreturn {start,test,result,score,home,getState:()=>state};');
  const location = { value: '', get hash() { return this.value; }, set hash(v) { this.value = v.startsWith('#') ? v : '#' + v; } };
  const api = create({querySelector:element,querySelectorAll:()=>[]}, location,
    {getItem:k=>saved[k] || null,setItem:(k,v)=>{saved[k]=v;}},
    {addEventListener(){},scrollTo(){}}, ()=>{});
  return {api,element,saved};
}
test('100 losowań: 20 różnych pytań, po 4 na kategorię, co najmniej 2 graficzne', () => {
  const {api} = setup();
  for(let i=0;i<100;i++) {
    api.start(); const t=api.getState().active;
    assert.equal(new Set(t.ids).size,20);
    assert.ok(t.ids.filter(id=>QUESTIONS[id].patterns).length>=2);
    for(let c=0;c<5;c++) assert.equal(t.ids.filter(id=>QUESTIONS[id].category===c).length,4);
  }
});
test('niepełny test nie może być wysłany; braki są wskazane', () => {
  const {api,element}=setup();api.start();
  assert.match(element('#app').innerHTML, /id="submit" disabled/);
  element('#submit').onclick();assert.ok(!element('#confirmation').open);
  element('#confirm-submit').onclick();assert.equal(api.getState().results.length,0);
  element('#find-missing').onclick();assert.match(element('#app').innerHTML,/Brakuje odpowiedzi na pytania:/);
});
test('anulowanie rezygnacji zachowuje próbę; potwierdzenie usuwa ją bez wyniku', () => {
  const {api,element,saved}=setup();api.start();const active=api.getState().active;
  active.answers[0]=1;api.test();element('#abandon').onclick();
  assert.ok(element('#abandonment').open);element('#cancel-abandon').onclick();
  assert.equal(api.getState().active,active);
  element('#abandon').onclick();element('#confirm-abandon').onclick();
  assert.equal(api.getState().active,null);assert.equal(api.getState().results.length,0);
  assert.equal(setup(saved).api.getState().active,null);
});
test('komplet odpowiedzi wymaga potwierdzenia, zapisuje 20/20 i renderuje grafiki w wyniku', () => {
  const {api,element,saved}=setup();api.start();const state=api.getState();
  state.active.answers=state.active.ids.map(id=>QUESTIONS[id].correct);api.test();
  assert.doesNotMatch(element('#app').innerHTML,/id="submit" disabled/);
  element('#submit').onclick();assert.ok(element('#confirmation').open);
  element('#cancel-submit').onclick();assert.ok(state.active);
  element('#submit').onclick();element('#confirm-submit').onclick();
  assert.equal(api.score(state.results[0]),20);assert.equal(state.active,null);
  api.result(0);assert.match(element('#app').innerHTML,/<svg/);
  const restored=setup(saved);assert.equal(restored.api.score(restored.api.getState().results[0]),20);
  api.start();element('#abandon').onclick();element('#confirm-abandon').onclick();
  assert.equal(state.results.length,1);
});
test('starsze próby zachowują swój klucz odpowiedzi', () => {
  const ids=Array.from({length:20},(_,i)=>i);
  const old={ids,answers:ids.map(id=>LEGACY_QUESTIONS[id].correct),startedAt:1000,finishedAt:2000,current:0};
  const {api}=setup({'tok-myslenia-v1':JSON.stringify({active:null,results:[old]})});
  assert.equal(api.score(api.getState().results[0]),20);
});
test('każdy graficzny wariant renderuje sekwencję i cztery odpowiedzi SVG', () => {
  const {api,element}=setup();api.start();const t=api.getState().active;
  for(const q of QUESTIONS.filter(q=>q.patterns)) {
    t.ids[0]=q.id;t.current=0;api.test();
    assert.equal((element('#app').innerHTML.match(/<svg /g)||[]).length,q.sequence.length+4);
    assert.match(element('#app').innerHTML,/aria-label="Sekwencja do uzupełnienia"/);
  }
});
test('strona startowa umożliwia wznowienie lub zastąpienie niedokończonej próby', () => {
  const {api,element,saved}=setup();
  api.home();assert.doesNotMatch(element('#app').innerHTML,/id="new-test"/);
  api.start();const old=api.getState().active;old.answers[0]=1;
  api.home();assert.match(element('#app').innerHTML,/Wznów swój test/);
  assert.match(element('#app').innerHTML,/id="new-test"/);
  element('#start').onclick();assert.equal(api.getState().active,old);
  element('#new-test').onclick();assert.ok(element('#replacement').open);
  element('#cancel-replacement').onclick();assert.ok(!element('#replacement').open);
  assert.equal(api.getState().active,old);assert.equal(old.answers[0],1);
  element('#new-test').onclick();element('#confirm-replacement').onclick();
  const fresh=api.getState().active;assert.ok(fresh!==old);
  assert.equal(fresh.current,0);assert.ok(fresh.answers.every(a=>a===null));
  assert.equal(fresh.ids.length,20);assert.equal(api.getState().results.length,0);
  assert.ok(setup(saved).api.getState().active.answers.every(a=>a===null));
});
