import { iso, parseIso, pad2 } from './dates.js';
const stamp = (d, t) => d.replace(/-/g, '') + (t ? 'T' + t.replace(':', '') + '00' : '');
const endStamp = (e) => {
  if (!e.time) { const nx = parseIso(e.date); nx.setDate(nx.getDate() + 1); return iso(nx).replace(/-/g, ''); }
  const p = e.time.split(':'), d = parseIso(e.date); d.setHours(+p[0], +p[1] + 30, 0, 0);
  return iso(d).replace(/-/g, '') + 'T' + pad2(d.getHours()) + pad2(d.getMinutes()) + '00';
};
export const gcalUrl = (e) => 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(e.title) + '&dates=' + stamp(e.date, e.time) + '/' + endStamp(e) + '&details=' + encodeURIComponent((e.notes ? e.notes + ' · ' : '') + e.kind + ' (from IELTS and Life Tracker)') + (e.loc ? '&location=' + encodeURIComponent(e.loc) : '');
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
export function buildIcs(list) {
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IELTS and Life Tracker//EN', 'CALSCALE:GREGORIAN'];
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  list.forEach((e) => {
    L.push('BEGIN:VEVENT', `UID:${e.id}@ielts-life-tracker`, `DTSTAMP:${now}`);
    if (e.time) L.push('DTSTART:' + stamp(e.date, e.time), 'DTEND:' + endStamp(e));
    else L.push('DTSTART;VALUE=DATE:' + stamp(e.date), 'DTEND;VALUE=DATE:' + endStamp(e));
    L.push('SUMMARY:' + esc(e.title), 'CATEGORIES:' + esc(e.kind));
    if (e.loc) L.push('LOCATION:' + esc(e.loc));
    if (e.notes) L.push('DESCRIPTION:' + esc(e.notes));
    if (e.pri === 'high') L.push('PRIORITY:1');
    if (e.time && e.remind >= 0) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(e.title), `TRIGGER:-PT${e.remind}M`, 'END:VALARM');
    L.push('END:VEVENT');
  });
  L.push('END:VCALENDAR');
  return L.join('\r\n');
}
export function downloadFile(filename, data, type) {
  const b = new Blob([data], { type: type || 'text/plain' }), a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
