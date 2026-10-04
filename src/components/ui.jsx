import { forwardRef } from 'react';

export const cx = (...a) => a.filter(Boolean).join(' ');

export const inputCls = 'min-w-0 rounded-2xl border border-line bg-[color-mix(in_srgb,var(--bg)_62%,var(--surface))] px-3.5 py-2.5 text-fg outline-none transition focus:border-accent focus:ring-[3px] focus:ring-accent/35 placeholder:text-muted/70';
export const Input = forwardRef(function Input({ className, ...p }, ref) { return <input ref={ref} className={cx(inputCls, 'w-full', className)} {...p} />; });
export const Select = forwardRef(function Select({ className, children, ...p }, ref) { return <select ref={ref} className={cx(inputCls, 'max-w-full', className)} {...p}>{children}</select>; });
export const Textarea = forwardRef(function Textarea({ className, short, ...p }, ref) { return <textarea ref={ref} className={cx(inputCls, 'w-full resize-y leading-relaxed', short ? 'min-h-[110px]' : 'min-h-[240px]', className)} {...p} />; });

const base = 'cursor-pointer font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal';
const variants = {
  primary: 'rounded-xl border-0 bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_62%,#22d3ee)] px-[18px] py-2.5 font-bold text-on-accent shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_40%,transparent)]',
  ghost: 'rounded-xl border border-line bg-transparent px-3.5 py-2 font-medium text-fg hover:border-accent',
  x: 'border-0 bg-transparent px-1.5 py-0.5 font-normal text-muted hover:text-bad',
};
export function Btn({ variant = 'primary', sm, big, className, type = 'button', ...p }) {
  return <button type={type} className={cx(base, variants[variant], sm && '!px-3 !py-1 !text-xs !shadow-none', big && '!px-[22px] !py-3 !text-base', className)} {...p} />;
}

export function Card({ className, as: Tag = 'section', ...p }) {
  return <Tag className={cx('card flex flex-col gap-2 rounded-[20px] border border-line border-l-4 border-l-[var(--stripe,var(--accent))] bg-gradient-to-br from-surface to-[color-mix(in_srgb,var(--stripe,var(--accent))_7%,var(--surface))] p-5 shadow-[0_10px_30px_rgba(0,0,0,.16)]', className)} {...p} />;
}
export const Section = ({ className, ...p }) => <section className={cx('flex flex-col gap-3', className)} {...p} />;
export const H2 = ({ className, ...p }) => <h2 className={cx('font-display text-[22px] font-bold tracking-tight', className)} {...p} />;
export const H3 = ({ className, ...p }) => <h3 className={cx('font-display text-base font-bold tracking-tight', className)} {...p} />;
export const Hint = ({ className, ...p }) => <p className={cx('text-[13px] text-muted', className)} {...p} />;
export const Row = ({ className, ...p }) => <div className={cx('flex flex-wrap items-center gap-2.5', className)} {...p} />;
export const Panel = ({ className, ...p }) => <div className={cx('panel flex flex-col gap-[18px]', className)} {...p} />;
export const Field = ({ label, className, children }) => (
  <label className={cx('flex min-w-0 flex-col gap-0.5 text-xs text-muted', className)}>{label}{children}</label>
);
export const Note = ({ className, ...p }) => <div className={cx('rounded-[14px] bg-signal-soft px-3 py-2.5 text-[13px]', className)} {...p} />;
export const Mini = ({ tag, tone = 'accent', className, children }) => (
  <div className={cx('flex flex-col gap-1.5 rounded-[14px] px-3 py-2.5 text-sm', tone === 'signal' ? 'bg-signal-soft' : 'bg-accent-soft', className)}>
    {tag && <span className={cx('text-[11px] font-semibold uppercase tracking-[.08em]', tone === 'signal' ? 'text-signal' : 'text-accent')}>{tag}</span>}
    {children}
  </div>
);
export function Band({ v, k, ov, mono = true }) {
  return (
    <div className={cx('min-w-[92px] rounded-[14px] border px-3 py-1.5', ov ? 'border-accent bg-accent-soft' : 'border-line')}>
      <div className={cx('font-display text-[22px] font-bold leading-tight', mono && 'font-mono')}>{v}</div>
      <div className="text-[11px] uppercase tracking-[.06em] text-muted">{k}</div>
    </div>
  );
}
export function Chip({ on, className, ...p }) {
  return <button type="button" aria-pressed={!!on} className={cx('cursor-pointer rounded-full border px-3 py-1 text-[13px] font-medium transition', on ? 'border-accent bg-accent text-on-accent' : 'border-line bg-transparent text-fg hover:border-accent', className)} {...p} />;
}
export const Seg = ({ className, ...p }) => <div className={cx('flex flex-wrap gap-1.5', className)} {...p} />;
export const Scroll = ({ className, ...p }) => <div className={cx('overflow-x-auto', className)} {...p} />;
export const Table = ({ className, ...p }) => <table className={cx('w-full min-w-[480px] border-collapse text-sm', className)} {...p} />;
export const Th = ({ className, ...p }) => <th className={cx('border-b border-line px-2 py-1.5 text-left text-xs font-medium uppercase tracking-[.06em] text-muted', className)} {...p} />;
export const Td = ({ className, ...p }) => <td className={cx('border-b border-line p-2 align-top', className)} {...p} />;
export const UL = ({ className, ...p }) => <ul className={cx('m-0 flex list-disc flex-col gap-1.5 pl-[18px]', className)} {...p} />;
export const A = (p) => <a target="_blank" rel="noopener noreferrer" className="text-accent underline" {...p} />;
export const ListRow = ({ className, ...p }) => <div className={cx('flex items-center gap-2.5 border-b border-line px-0.5 py-2 last:border-b-0', className)} {...p} />;
export const Check = ({ className, ...p }) => <input type="checkbox" className={cx('h-5 w-5 flex-none cursor-pointer accent-[var(--accent)]', className)} {...p} />;
export const Mono = ({ className, ...p }) => <span className={cx('font-mono tabular-nums', className)} {...p} />;
