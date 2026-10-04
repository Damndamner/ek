let AC = null;
export function ensureAudio() { try { if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); } if (AC && AC.state === 'suspended') AC.resume(); } catch (e) { /* ignore */ } }
export function beep(n = 1, freq = 880) {
  try {
    ensureAudio(); if (!AC) return;
    for (let i = 0; i < n; i++) {
      const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = freq; o.connect(g); g.connect(AC.destination);
      const t = AC.currentTime + i * 0.28;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.start(t); o.stop(t + 0.25);
    }
  } catch (e) { /* ignore */ }
}
export function chime() {
  try {
    ensureAudio(); if (!AC) return;
    [660, 880].forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = f; g.gain.value = 0.08; o.connect(g); g.connect(AC.destination); o.start(AC.currentTime + i * 0.12); o.stop(AC.currentTime + i * 0.12 + 0.14); });
  } catch (e) { /* ignore */ }
}
export function confetti() {
  const cs = getComputedStyle(document.documentElement), h = document.createElement('div');
  h.className = 'lf-conf';
  const c = [cs.getPropertyValue('--accent').trim() || '#0a6b5b', cs.getPropertyValue('--signal').trim() || '#b45309', '#fbbf24', '#4ade80', '#f472b6', '#38bdf8'];
  for (let i = 0; i < 24; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + 'vw'; s.style.background = c[i % c.length];
    s.style.animationDelay = Math.random() * 0.3 + 's'; s.style.animationDuration = 1.1 + Math.random() * 0.8 + 's'; h.appendChild(s);
  }
  document.body.appendChild(h); setTimeout(() => h.remove(), 2200);
}
