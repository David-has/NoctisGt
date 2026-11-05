'use strict';
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const header = $('#header'), nav = $('#nav'), menuBtn = $('#menuBtn');
addEventListener('scroll', () => header.classList.toggle('solid', scrollY > 60), { passive: true });
const setMenu = open => {
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
  document.body.style.overflow = open ? 'hidden' : '';
};
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));

const countUp = el => {
  const end = +el.dataset.count, dec = +el.dataset.dec || 0, t0 = performance.now(), dur = reduce ? 1 : 1800;
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1), v = end * (1 - Math.pow(1 - p, 3));
    el.textContent = v.toLocaleString('ro-RO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  $$('[data-count]', e.target).forEach(countUp);
  if (e.target.id === 'specificatii') $('.panel:not([hidden])', e.target).classList.add('on');
  io.unobserve(e.target);
}), { threshold: .2 });
$$('.reveal, .stats').forEach(el => io.observe(el));

const tabs = $$('[role=tab]');
const selectTab = tab => {
  tabs.forEach(t => {
    const on = t === tab, p = $('#' + t.getAttribute('aria-controls'));
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    p.hidden = !on;
    p.classList.toggle('on', on);
  });
  tab.focus();
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) selectTab(tabs[(i + d + tabs.length) % tabs.length]);
  });
});

const car = $('#heroCar');
if (!reduce && matchMedia('(pointer:fine)').matches) {
  $('.hero').addEventListener('mousemove', e => {
    const x = (e.clientX / innerWidth - .5) * -18, y = (e.clientY / innerHeight - .5) * -10;
    car.style.transform = `translate(${x}px, ${y}px)`;
  });
}

const items = $$('.g'), lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
let idx = 0, opener = null;
const show = i => {
  idx = (i + items.length) % items.length;
  lbImg.src = items[idx].dataset.full;
  lbImg.alt = $('img', items[idx]).alt;
  lbCap.textContent = items[idx].dataset.cap;
};
const openLb = i => { opener = items[i]; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbClose').focus(); };
const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; opener && opener.focus(); };
items.forEach((b, i) => b.addEventListener('click', () => openLb(i)));
$('#lbClose').addEventListener('click', closeLb);
$('#lbPrev').addEventListener('click', () => show(idx - 1));
$('#lbNext').addEventListener('click', () => show(idx + 1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!lb.hidden) closeLb(); else setMenu(false); }
  if (lb.hidden) return;
  if (e.key === 'ArrowLeft') show(idx - 1);
  if (e.key === 'ArrowRight') show(idx + 1);
});

const form = $('#form'), ok = $('#formOk');
const rules = {
  name: v => v.trim().split(/\s+/).filter(Boolean).length >= 2 || 'Scrie numele și prenumele.',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Introdu o adresă de email validă.',
  city: v => !!v || 'Alege orașul tău.'
};
const check = f => {
  const r = rules[f.name](f.value), lab = f.closest('label');
  lab.classList.toggle('invalid', r !== true);
  $('small', lab).textContent = r === true ? '' : r;
  return r === true;
};
$$('input,select', form).forEach(f => f.addEventListener('blur', () => check(f)));
form.addEventListener('submit', e => {
  e.preventDefault();
  const valid = $$('input,select', form).map(check).every(Boolean);
  if (!valid) return $('.invalid input, .invalid select', form).focus();
  ok.textContent = `Mulțumim, ${form.name.value.split(' ')[0]}. Te sunăm în 24 de ore pentru exemplarul din ${form.city.value}.`;
  ok.hidden = false;
  form.reset();
});