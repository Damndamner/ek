import { useApp } from '../store.jsx';
import { cx } from './ui.jsx';

export default function Pops() {
  const { pops, closePop } = useApp();
  return (
    <div className="pointer-events-none fixed left-1/2 top-2.5 z-[90] flex w-[min(380px,calc(100vw-24px))] -translate-x-1/2 flex-col gap-2" role="status" aria-live="polite">
      {pops.map((p) => (
        <div key={p.id} className={cx('pop-in pointer-events-auto flex items-start gap-2.5 rounded-xl border border-line border-l-[6px] bg-surface p-[10px_12px] text-fg shadow-[0_8px_28px_rgba(0,0,0,.22)] transition duration-200',
          p.kind === 'remind' ? 'border-l-signal' : p.kind === 'badge' ? 'border-l-ok' : 'border-l-accent', p.out && '-translate-y-2 opacity-0')}>
          <span className="text-[22px] leading-[1.1]">{p.icon || '✅'}</span>
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold">{p.title}</div>
            {p.msg && <div className="break-words text-sm">{p.msg}</div>}
            {p.actions && p.actions.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {p.actions.map((a) => (
                  <button key={a.label} type="button" onClick={() => { closePop(p.id); a.fn(); }}
                    className={cx('cursor-pointer rounded-xl border px-3 py-1 text-xs font-semibold', a.ghost ? 'border-line bg-transparent text-fg' : 'border-accent bg-accent text-on-accent')}>{a.label}</button>
                ))}
              </div>
            )}
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => closePop(p.id)} className="cursor-pointer border-0 bg-transparent px-1 text-base text-muted">✕</button>
        </div>
      ))}
    </div>
  );
}
