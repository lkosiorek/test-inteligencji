const app = document.querySelector('#app');
const KEY = 'tok-myslenia-v1';
let state = { active: null, results: [] }, storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved && Array.isArray(saved.results)) {
    const valid = t => t && Array.isArray(t.ids) && t.ids.length === 20 && new Set(t.ids).size === 20 && t.ids.every(id => QUESTIONS[id]) && Array.isArray(t.answers) && t.answers.length === 20 && t.answers.every(a => a === null || (Number.isInteger(a) && a >= 0 && a < 4)) && Number.isFinite(t.startedAt) && Number.isInteger(t.current) && t.current >= 0 && t.current < 20;
    state.results = saved.results.filter(r => valid(r) && r.answers.every(a => a !== null) && Number.isFinite(r.finishedAt)).slice(0, 20);
    state.active = valid(saved.active) ? saved.active : null;
  }
} catch { storageAvailable = false; }
let validation = false;
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { storageAvailable = false; }
}
function notice() { return storageAvailable ? '' : '<p class="notice" role="status">Zapis lokalny jest niedostępny. Postęp działa w tej karcie, ale może zniknąć po jej zamknięciu.</p>'; }
function duration(ms) { const s = Math.floor(Math.max(0, ms) / 1000); return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`; }
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
// Grafikę tworzymy z własnych figur SVG; opisy tekstowe są dostępne także bez rozpoznawania barw.
function patternSvg(pattern, label) {
  const colors = { red: '#bb3c43', blue: '#356eb7', yellow: '#d6a326', green: '#397958' };
  let shape = '';
  if (colors[pattern]) shape = `<circle cx="48" cy="36" r="22" fill="${colors[pattern]}"/>`;
  else if (pattern.startsWith('pair')) {
    const pair = pattern.slice(4);
    shape = [...pair].map((c,i)=>`<circle cx="${28+i*40}" cy="36" r="16" fill="${c==='R'?colors.red:colors.blue}"/>`).join('');
  } else if (pattern.startsWith('dots')) {
    const count = Number(pattern.slice(4));
    shape = Array.from({length:count},(_,i)=>`<circle cx="${28+(i%3)*20}" cy="${count>3?24+Math.floor(i/3)*24:36}" r="7" fill="#244d40"/>`).join('');
  } else if (pattern.startsWith('cell')) {
    shape = Array.from({length:4},(_,i)=>`<rect x="${5+i*22}" y="25" width="20" height="22" rx="2" fill="${i===Number(pattern.slice(4))-1?'#244d40':'#e0e5da'}" stroke="#78916a"/>`).join('');
  } else if (['up','right','down','left'].includes(pattern)) {
    const angle = {up:0,right:90,down:180,left:270}[pattern];
    shape = `<path d="M48 12 L68 34 H56 V60 H40 V34 H28 Z" fill="#244d40" transform="rotate(${angle} 48 36)"/>`;
  } else {
    shape = {circle:'<circle cx="48" cy="36" r="22"/>',triangle:'<path d="M48 10 L74 60 H22 Z"/>',square:'<rect x="26" y="14" width="44" height="44" rx="2"/>',diamond:'<path d="M48 8 L76 36 L48 64 L20 36 Z"/>'}[pattern] || '';
  }
  return `<svg class="pattern-svg" viewBox="0 0 96 72" role="img" aria-label="${label}" fill="#244d40">${shape}</svg>`;
}
function questionFor(t, id) { return t.questionVersion === 2 ? QUESTIONS[id] : LEGACY_QUESTIONS[id]; }
function sequenceMarkup(q) {
  if (!q.sequence) return '';
  const labels = {red:'Czerwone koło',blue:'Niebieskie koło',circle:'Koło',triangle:'Trójkąt',square:'Kwadrat',up:'Strzałka w górę',right:'Strzałka w prawo',down:'Strzałka w dół',left:'Strzałka w lewo',pairRR:'Dwa czerwone koła',pairBB:'Dwa niebieskie koła'};
  return `<div class="pattern-sequence" role="group" aria-label="Sekwencja do uzupełnienia">${q.sequence.map(p=>`<div class="pattern-tile">${patternSvg(p,labels[p] || (p.startsWith('dots')?`Liczba kropek: ${p.slice(4)}`:`Ciemne pole na pozycji ${p.slice(4)}`))}</div>`).join('')}<span class="pattern-unknown" aria-label="Brakujący wzorzec">?</span></div>`;
}
function answerMarkup(q, n) {
  return q.patterns ? `<span class="graphic-answer">${patternSvg(q.patterns[n], q.options[n])}<span>${q.options[n]}</span></span>` : q.options[n];
}
function start() {
  const visual = shuffle(QUESTIONS.filter(q => q.patterns)).slice(0, 2);
  const firstCategory = shuffle([...visual, ...shuffle(QUESTIONS.filter(q => q.category === 0 && !visual.includes(q))).slice(0, 2)]);
  state.active = { questionVersion: 2, ids: CATEGORIES.flatMap((_, c) => (c === 0 ? firstCategory : shuffle(QUESTIONS.filter(q => q.category === c)).slice(0, 4)).map(q => q.id)), answers: Array(20).fill(null), startedAt: Date.now(), current: 0 };
  validation = false; persist(); location.hash = 'test'; render();
}
function requestNewTest() {
  if (state.active) document.querySelector('#replacement').showModal();
  else start();
}
function home() {
  app.innerHTML = `${notice()}<section class="hero"><div><p class="eyebrow">20 PYTAŃ. WIELE SPOSOBÓW MYŚLENIA.</p><h1>Sprawdź swoje<br><em>logiczne myślenie.</em></h1><p class="intro">Dostrzegaj wzorce, łącz fakty i wyciągaj wnioski. Daj sobie chwilę na małe wyzwanie dla umysłu.</p><div class="actions"><button id="start">${state.active ? 'Wznów swój test' : 'Rozpocznij test'} <span>↗</span></button>${state.active ? '<button class="secondary" id="new-test">Rozpocznij nowy test</button>' : ''}<span class="quiet">Około 15–25 minut<br>We własnym tempie</span></div><p class="small">To autorski test rozumowania. Nie jest standaryzowanym testem IQ według jakichkolwiek formalnych norm i nie służy do pomiaru ilorazu inteligencji.</p></div><div class="art" aria-hidden="true"><div class="art-caption">KAŻDA PERSPEKTYWA MA ZNACZENIE</div><div class="orbit o1"></div><div class="orbit o2"></div><div class="orbit o3"></div><div class="orb"></div><span class="art-label">POŁĄCZ KROPKI.<br>ODKRYJ ZALEŻNOŚCI.</span></div></section><section class="features"><article><span>01 / ODKRYWAJ</span><h3>Pięć obszarów logiki</h3><p>Od sekwencji kolorów i wzorców graficznych po związki przyczynowo-skutkowe. Różne zadania, wspólny cel.</p></article><article><span>02 / POMYŚL</span><h3>Twoje tempo, Twoje decyzje</h3><p>Wracaj do pytań i zmieniaj odpowiedzi. Postęp zapisuje się automatycznie.</p></article><article><span>03 / ZROZUM</span><h3>Więcej niż sam wynik</h3><p>Poznaj poprawne odpowiedzi i tok rozumowania stojący za każdą z nich.</p></article></section>${state.results.length ? `<section class="history"><p class="eyebrow">TWOJE OSTATNIE PRÓBY</p>${state.results.map((r,i)=>`<a class="history-row" href="#wynik/${i}"><span>${new Date(r.finishedAt).toLocaleString('pl-PL')}</span><strong>${score(r)} / 20</strong><span>${duration(r.finishedAt-r.startedAt)} →</span></a>`).join('')}</section>` : ''}`;
  document.querySelector('#start').onclick = () => { if (state.active) { location.hash = 'test'; } else start(); };
  const newTest = document.querySelector('#new-test');
  if (state.active && newTest) newTest.onclick = requestNewTest;
}
function test() {
  const t = state.active;
  if (!t) { location.hash = 'start'; return; }
  const i = t.current, q = questionFor(t, t.ids[i]), count = t.answers.filter(a=>a !== null).length;
  app.innerHTML = `${notice()}<div class="test-top"><a href="#start">← Strona startowa</a><span>Czas: <strong id="timer">${duration(Date.now()-t.startedAt)}</strong></span></div><div class="test-layout"><aside><p class="eyebrow">TWÓJ POSTĘP</p><h2>${count}<span class="muted"> / 20</span></h2><label for="progress">Udzielone odpowiedzi</label><progress id="progress" max="20" value="${count}"></progress>${CATEGORIES.map((c,ci)=>`<div class="nav-category"><h3>${c}</h3><div class="question-nav">${t.ids.map((id,n)=> QUESTIONS[id].category === ci ? `<button aria-label="Pytanie ${n+1}${t.answers[n] !== null ? ', odpowiedź zapisana' : ', bez odpowiedzi'}" ${n===i?'aria-current="step"':''} class="nav-button ${n===i?'current':''} ${t.answers[n]!==null?'answered':''} ${validation&&t.answers[n]===null?'missing':''}" data-question="${n}">${n+1}</button>` : '').join('')}</div></div>`).join('')}<p class="small">● Zapisane odpowiedzi możesz zmienić.</p></aside><section class="question-card"><p class="eyebrow">${CATEGORIES[q.category].toUpperCase()} <span class="question-count">PYTANIE ${i+1} Z 20</span></p><h1 class="question-title" tabindex="-1">${q.text}</h1>${sequenceMarkup(q)}<p class="muted">Wybierz jedną odpowiedź.</p><fieldset><legend class="sr-only">Odpowiedzi na pytanie ${i+1}</legend>${q.options.map((o,n)=>`<label class="option ${t.answers[i]===n?'selected':''}"><input type="radio" name="answer" value="${n}" ${t.answers[i]===n?'checked':''}><span class="letter">${'ABCD'[n]}</span><span>${answerMarkup(q,n)}</span><span class="check">${t.answers[i]===n?'✓':''}</span></label>`).join('')}</fieldset>${validation && count<20 ? `<p class="notice" role="alert">Brakuje odpowiedzi na pytania: ${t.answers.flatMap((a,n)=>a===null?[n+1]:[]).join(', ')}. Wybierz zaznaczony numer, aby je uzupełnić.</p>`:''}<div class="question-actions"><button class="secondary" id="previous" ${i===0?'disabled':''}>← Poprzednie</button>${i<19?'<button id="next">Następne pytanie →</button>':''}</div><div class="submission-actions"><button id="submit" ${count<20?'disabled aria-describedby="completion-hint"':''}>Wyślij odpowiedzi i zobacz wynik →</button><button class="text-button" id="abandon">Zrezygnuj z testu</button></div>${count<20?`<p id="completion-hint" class="small">Wysyłanie dostępne po uzupełnieniu wszystkich odpowiedzi (${count}/20).</p><button class="text-button find-missing" id="find-missing">Pokaż nieuzupełnione pytania</button>`:''}<p class="small">Postęp zapisuje się w tej przeglądarce. Czas obejmuje również przerwy.</p></section></div>`;
  document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>navigate(Number(b.dataset.question)));
  document.querySelectorAll('[name="answer"]').forEach(input=>input.onchange=()=>{ t.answers[i]=Number(input.value); persist(); const focused = input.value; test(); document.querySelector(`[name="answer"][value="${focused}"]`).focus(); });
  document.querySelector('#previous').onclick=()=>navigate(i-1);
  const next=document.querySelector('#next'); if(next)next.onclick=()=>navigate(i+1);
  document.querySelector('#abandon').onclick=()=>document.querySelector('#abandonment').showModal();
  const missing = document.querySelector('#find-missing');
  if(missing) missing.onclick=()=>{validation=true;navigate(t.answers.findIndex(a=>a===null));};
  document.querySelector('#submit').onclick=()=>{
    if(t.answers.some(a=>a===null)){ validation=true; navigate(t.answers.findIndex(a=>a===null)); return; }
    document.querySelector('#confirmation').showModal();
  };
}
function navigate(i) { state.active.current=i; persist(); test(); document.querySelector('.question-title').focus(); }
function score(t) { return t.ids.reduce((s,id,i)=>s+Number(t.answers[i]===questionFor(t,id).correct),0); }
function assessment(s) {
  if(s>=17)return ['Bardzo dobry wynik', 'Sprawnie rozpoznajesz zależności i wyciągasz trafne wnioski w zadaniach tej próby. Przyjrzyj się wyjaśnieniom, aby porównać je ze swoim sposobem myślenia.'];
  if(s>=13)return ['Dobry wynik', 'Dobrze radzisz sobie z większością zadań tej próby. Analiza kilku pomyłek pomoże Ci zauważyć reguły i założenia, które łatwo przeoczyć.'];
  if(s>=9)return ['Solidny punkt wyjścia', 'Część zależności rozpoznajesz trafnie, inne warto spokojnie przeanalizować. Wyjaśnienia pokażą krok po kroku drogę do poprawnego wniosku.'];
  return ['Przestrzeń do ćwiczeń', 'Ta próba okazała się wymagająca. Zacznij od wyjaśnień i zwróć uwagę na różnicę między tym, co jest pewne, a tym, co tylko możliwe.'];
}
function result(index) {
  const t=state.results[index]; if(!t){location.hash='start';return;}
  const s=score(t), [title,description]=assessment(s);
  app.innerHTML=`${notice()}<div class="test-top"><a href="#start">← Strona startowa i historia</a><span>PRÓBA Z ${new Date(t.finishedAt).toLocaleDateString('pl-PL')}</span></div><section class="result-hero"><div><p class="eyebrow">TWÓJ WYNIK TESTU</p><h1>${title}</h1><p class="intro">${description}</p><p>Czas rozwiązywania: <strong>${duration(t.finishedAt-t.startedAt)}</strong></p><button id="restart">Rozpocznij nowy test ↗</button></div><div class="score"><strong>${s}<span>/ 20</span></strong><p>${s*5}% poprawnych odpowiedzi</p></div></section><p class="notice">Wynik opisuje wykonanie tej próby. Nie jest pomiarem IQ ani diagnozą poziomu inteligencji. Na rezultat mogą wpływać m.in. skupienie, zmęczenie i znajomość podobnych zadań.</p><section class="category-results">${CATEGORIES.map((c,ci)=>{ const ids=t.ids.map((id,i)=>({q:questionFor(t,id),i})).filter(x=>x.q.category===ci); return `<article><span>${c}</span><strong>${ids.filter(x=>t.answers[x.i]===x.q.correct).length} / 4</strong></article>`; }).join('')}</section><section class="review"><p class="eyebrow">ZROZUM SWOJE ODPOWIEDZI</p><h2>Liczy się sposób myślenia.</h2><p class="muted">Rozwiń pytanie, aby poznać uzasadnienie poprawnej odpowiedzi.</p>${t.ids.map((id,i)=>{const q=questionFor(t,id),ok=t.answers[i]===q.correct;return `<details><summary><span class="status ${ok?'good':'bad'}">${ok?'✓':'×'}</span><span><small>Pytanie ${i+1} · ${CATEGORIES[q.category]} · ${ok?'Poprawna odpowiedź':'Błędna odpowiedź'}</small>${q.text}</span><span class="expand">+</span></summary><div class="explanation">${sequenceMarkup(q)}<p>Twoja odpowiedź: <strong>${answerMarkup(q,t.answers[i])}</strong></p>${!ok?`<p>Poprawna odpowiedź: <strong>${answerMarkup(q,q.correct)}</strong></p>`:''}<p>${q.explanation}</p></div></details>`;}).join('')}</section>`;
  document.querySelector('#restart').onclick=requestNewTest;
}
function render() {
  document.querySelector('#confirmation').close();
  document.querySelector('#abandonment').close();
  document.querySelector('#replacement').close();
  const hash=location.hash.slice(1);
  if(hash==='test')test(); else if(/^wynik\/\d+$/.test(hash))result(Number(hash.split('/')[1])); else home();
}
document.querySelector('#cancel-submit').onclick=()=>document.querySelector('#confirmation').close();
document.querySelector('#confirm-submit').onclick=()=>{
  if(!state.active || state.active.answers.some(a=>a===null))return;
  const completed={...state.active, answers:[...state.active.answers], finishedAt:Date.now()};
  state.results.unshift(completed);state.results=state.results.slice(0,20);state.active=null;persist();
  document.querySelector('#confirmation').close();location.hash='wynik/0';
};
document.querySelector('#cancel-abandon').onclick=()=>document.querySelector('#abandonment').close();
document.querySelector('#confirm-abandon').onclick=()=>{
  state.active=null; validation=false; persist();
  document.querySelector('#abandonment').close(); location.hash='start'; render();
};
document.querySelector('#cancel-replacement').onclick=()=>document.querySelector('#replacement').close();
document.querySelector('#confirm-replacement').onclick=()=>{
  document.querySelector('#replacement').close();
  start();
};
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
setInterval(()=>{const timer=document.querySelector('#timer');if(timer&&state.active)timer.textContent=duration(Date.now()-state.active.startedAt);},1000);
persist();render();
