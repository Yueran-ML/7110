import { useEffect, useMemo, useState } from 'react'
import useLocalTranslation from './useLocalTranslation.js'
import { applyTranslations, containsChinese, englishCard, translationFields, untranslatedFields } from './translation.js'
import {
  CONTENT_DATE,
  artefacts,
  askClinic,
  bookingChecklist,
  clocks,
  costFacts,
  exampleNote,
  glossary,
  pathologyQuickActions,
  places,
  prep,
  services,
  sources,
  ui,
} from './content.js'

import {
  todayIso,
  isIso,
  shift,
  daysUntil,
  isTaskDateValid,
} from './dateUtils.js'

// ---------- persistence: everything stays on this phone ----------

function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function useStored(key, fallback) {
  const [value, setValue] = useState(() => readStored(key, fallback))
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable: the app still works for this session
    }
  }, [key, value])
  return [value, setValue]
}

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  return new Promise((resolve) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch {
      // ignore
    }
    document.body.removeChild(ta)
    resolve()
  })
}

function useFlash(ms = 1600) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!on) return undefined
    const id = window.setTimeout(() => setOn(false), ms)
    return () => window.clearTimeout(id)
  }, [on, ms])
  return [on, () => setOn(true)]
}

// ---------- dates: local calendar days, no time zones ----------



function remaining(diff, lang) {
  const zh = lang === 'zh'
  if (diff < 0) return zh ? `已过 ${-diff} 天` : `${-diff} day${diff === -1 ? '' : 's'} ago`
  if (diff === 0) return zh ? '今天' : 'Today'
  if (diff === 1) return zh ? '明天' : 'Tomorrow'
  if (diff <= 60) return zh ? `还剩 ${diff} 天` : `In ${diff} days`
  const months = Math.round(diff / 30.4)
  return zh ? `还剩约 ${months} 个月` : `In about ${months} months`
}

function quickLabel(q, lang) {
  if (q.months) return lang === 'zh' ? `+${q.months} 个月` : `+${q.months} months`
  return lang === 'zh' ? `+${q.days} 天` : `+${q.days} days`
}

function buildClocks({ picked, visitDate, dates, done }) {
  if (!isIso(visitDate) || visitDate > todayIso()) return []
  const rows = []
  for (const c of clocks) {
    if (c.scope !== 'visit' && !picked.includes(c.scope)) continue
    if (c.kind === 'fixed') {
      rows.push({ ...c, due: shift(visitDate, c), done: !!done[c.id] })
      continue
    }
    const entered = isTaskDateValid(visitDate, dates[c.id])
      ? dates[c.id]
      : null
    rows.push({ ...c, due: entered, done: !!done[c.id] })
    if (entered && c.derives) {
      const d = c.derives
      rows.push({ ...d, kind: 'fixed', scope: c.scope, due: shift(entered, d), done: !!done[d.id] })
    }
  }
  const withDiff = rows.map((r) => ({ ...r, diff: r.due ? daysUntil(r.due) : null }))
  withDiff.sort((a, b) => {
    if (a.due && b.due) return a.diff - b.diff
    if (a.due) return -1
    if (b.due) return 1
    return 0
  })
  return withDiff
}

const hasText = (value) => typeof value === 'string' && value.trim() !== ''

function visitSummary({ note, visitDate, picked, picksAreExample, done, rows }) {
  const written = note && !note.example ? note : {}
  const ownPicks = picksAreExample ? [] : picked
  const chosen = artefacts.filter((a) => ownPicks.includes(a.id))
  const stepIds = chosen.flatMap((a) => a.steps.map((_, i) => `${a.id}-${i}`))
  return {
    visitDate: isIso(visitDate) ? visitDate : '',
    clinic: written.clinic ?? '',
    said: written.said ?? '',
    comeBack: written.comeBack ?? '',
    picked: chosen.map((a) => a.id),
    stepsDone: stepIds.filter((id) => done[id]).length,
    stepsTotal: stepIds.length,
    upcoming: rows
      .filter((r) => (r.scope === 'visit' || ownPicks.includes(r.scope)) && r.due && !r.done)
      .map((r) => ({ label: r.label, due: r.due })),
  }
}

// ---------- small pieces ----------

const Icon = ({ name }) => {
  const paths = {
    home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',
    before: 'M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    visit: 'M4 5.5h16v10H9l-5 4v-14Z',
    after: 'M7 3.5h7l4 4V20.5H7v-17Zm7 0v4h4M9.5 14.5l2 2 3.5-4',
    terms: 'M4 5.5a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2v-15Zm0 15a2 2 0 0 1 2-2h12M8.5 8h6',
    notes: 'M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17ZM9 8h6M9 11.5h6',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    copy: 'M9 9.5h10v11H9v-11Zm-4-6h10v3M5 3.5v11h3',
    guide: 'M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6M4 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0M16 6a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
    calendar: 'M5 6.5h14v13H5v-13Zm0 4h14M9 4v4.5M15 4v4.5',
    lock: 'M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5M5.5 10.5h13v10h-13v-10Zm6.5 4v2.5',
  }
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

function OwnerChip({ owner, t }) {
  return <span className={`owner owner-${owner}`}>{t(ui.owners[owner])}</span>
}

function SourceLine({ source, t }) {
  const details = sources[source]
  return (
    <span className="source">
      <span>{t(ui.after.sourceLabel)}: {t(details)}</span>
      {details.url && (
        <>
          <a className="source-link" href={details.url} target="_blank" rel="noopener noreferrer">
            {t(details.linkLabel)} <span aria-hidden="true">↗</span>
          </a>
          <span className="source-reviewed">{t(ui.after.reviewedLabel)}: {details.reviewed}</span>
        </>
      )}
    </span>
  )
}

function PathologyQuickActions({ t }) {
  const [copied, flash] = useFlash()
  const questions = pathologyQuickActions.questions.map((question) => question.en).join('\n')

  return (
    <div className="card pathology-actions">
      <h4 className="pathology-actions-title">{t(pathologyQuickActions.title)}</h4>
      <p className="muted">{t(pathologyQuickActions.lead)}</p>
      <ul className="pathology-questions">
        {pathologyQuickActions.questions.map((question) => (
          <li key={question.en}>{t(question)}</li>
        ))}
      </ul>
      <div className="actions">
        <a
          className="btn"
          href={pathologyQuickActions.finderUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t(pathologyQuickActions.finderLabel)} <span aria-hidden="true">↗</span>
        </a>
        <button type="button" className="btn ghost" onClick={() => copyText(questions).then(flash)}>
          <Icon name="copy" /> {copied ? t(pathologyQuickActions.copiedLabel) : t(pathologyQuickActions.copyLabel)}
        </button>
      </div>
    </div>
  )
}

function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          type="button"
          aria-selected={value === o.id}
          className={value === o.id ? 'is-on' : ''}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function StageRail({ current, t, go }) {
  const order = ['before', 'visit', 'after']
  return (
    <ol className="rail" aria-label="Visit stages">
      {order.map((s, i) => {
        const state = order.indexOf(current) > i ? 'past' : current === s ? 'now' : 'next'
        return (
          <li key={s} className={`rail-stop rail-${state}`}>
            <button type="button" onClick={() => go(s)} aria-current={current === s ? 'step' : undefined}>
              <span className="rail-dot" />
              <span className="rail-label">{t(ui.tabs[s])}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function TermsLink({ t, go }) {
  return (
    <div className="quiet-links">
      <button type="button" className="link" onClick={() => go('terms')}>
        <Icon name="terms" /> {t(ui.home.termsLink)}
      </button>
    </div>
  )
}

function StageNav({ current, t, go }) {
  const order = ['before', 'visit', 'after']
  const index = order.indexOf(current)
  const prev = order[index - 1]
  const next = order[index + 1] ?? 'notes'
  const title = (id) => t(id === 'notes' ? ui.tabs.notes : ui.stages[id].title)
  return (
    <nav className="stage-nav" aria-label={t(ui.stageNav.label)}>
      {prev ? (
        <button type="button" className="stage-step prev" onClick={() => go(prev)}>
          <span className="stage-step-dir">← {t(ui.stageNav.prev)}</span>
          <span className="stage-step-title">{title(prev)}</span>
        </button>
      ) : <span aria-hidden="true" />}
      <button type="button" className="stage-step next" onClick={() => go(next)}>
        <span className="stage-step-dir">{t(ui.stageNav.next)} →</span>
        <span className="stage-step-title">{title(next)}</span>
      </button>
    </nav>
  )
}

function DateInput({ id, value, onChange, min, max, label, placeholder, invalid, describedBy }) {
  const openPicker = (event) => {
    try {
      event.currentTarget.showPicker?.()
    } catch {
      // Where showPicker is blocked, the native control still opens on tap.
    }
  }
  return (
    <span className={`date-input ${value ? 'has-value' : ''} ${invalid ? 'is-invalid' : ''}`}>
      <span className="date-input-text" aria-hidden="true">{value || placeholder}</span>
      <Icon name="calendar" />
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onClick={openPicker}
      />
    </span>
  )
}

function ConfirmButton({ className, label, confirmLabel, onConfirm }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return undefined
    const id = window.setTimeout(() => setArmed(false), 4000)
    return () => window.clearTimeout(id)
  }, [armed])
  return (
    <button
      type="button"
      className={`${className} ${armed ? 'is-armed' : ''}`}
      onClick={() => {
        if (!armed) {
          setArmed(true)
          return
        }
        setArmed(false)
        onConfirm()
      }}
    >
      {armed ? confirmLabel : label}
    </button>
  )
}

function Badge({ diff, lang, muted }) {
  const cls = muted ? '' : diff < 0 ? 'is-over' : diff <= 7 ? 'is-soon' : diff <= 30 ? 'is-near' : ''
  return <span className={`badge num ${cls}`}>{remaining(diff, lang)}</span>
}


function VisitDateBar({ t, visitDate, setVisitDate }) {
  const invalid = visitDate !== '' && !isIso(visitDate)
  const future = isIso(visitDate) && visitDate > todayIso()
  const error = invalid || future

  return (
    <div className="datebar">
      <label className="label" htmlFor="visit-date">
        {t(ui.tracker.visitDate)}
      </label>

      <div className="datebar-row">
        <DateInput
          id="visit-date"
          value={visitDate}
          max={todayIso()}
          placeholder={t(ui.tracker.pickDate)}
          invalid={error}
          describedBy={error ? 'visit-date-error' : undefined}
          onChange={setVisitDate}
        />

        <button
          type="button"
          className="chip"
          onClick={() => setVisitDate(todayIso())}
        >
          {t(ui.tracker.today)}
        </button>
      </div>

      {error && (
        <p id="visit-date-error" className="date-error" role="alert">
          {t(invalid
            ? ui.tracker.invalidDate
            : ui.tracker.futureVisitDate)}
        </p>
      )}
    </div>
  )
}



function ClockRow({ row, t, lang, visitDate, dates, setDates, done, setDone }) {
  const setDate = (value) => {
    setDates((current) => ({
      ...current,
      [row.id]: value,
    }))
  }

  const enteredDate = dates[row.id] ?? ''

  const hasDateError =
    row.kind === 'entered' &&
    enteredDate !== '' &&
    !isTaskDateValid(visitDate, enteredDate)

  return (
    <li className={`clock ${row.done ? 'is-done' : ''}`}>
      <label className="check">
        <input
          type="checkbox"
          checked={row.done}
          onChange={(e) =>
            setDone({ ...done, [row.id]: e.target.checked })
          }
        />
        <span className="check-box" aria-hidden="true">
          <Icon name="check" />
        </span>
        <span className="clock-body">
          <span className="clock-head">
            <span className="clock-label">{t(row.label)}</span>
            {row.due ? (
              <Badge diff={row.diff} lang={lang} muted={row.done} />
            ) : (
              <span className="badge is-empty">
                {t(ui.tracker.notSet)}
              </span>
            )}
          </span>
          {row.due && (
            <span className="clock-date num">{row.due}</span>
          )}
          <span className="clock-rule">
            {t(row.rule ?? row.ask)}
          </span>
          <SourceLine source={row.source} t={t} />
        </span>
      </label>

      {row.kind === 'entered' && !row.done && (
        <div className="clock-entry">
          <DateInput
            value={enteredDate}
            min={visitDate}
            label={t(row.label)}
            placeholder={t(ui.tracker.pickDate)}
            invalid={hasDateError}
            describedBy={hasDateError ? `date-error-${row.id}` : undefined}
            onChange={setDate}
          />

          {hasDateError && (
            <p
              id={`date-error-${row.id}`}
              className="date-error"
              role="alert"
            >
              {t(ui.tracker.invalidTaskDate)}
            </p>
          )}

          {(row.quick ?? []).map((q) => (
            <button
              key={quickLabel(q, 'en')}
              type="button"
              className="chip small"
              onClick={() => setDate(shift(visitDate, q))}
            >
              {quickLabel(q, lang)}
            </button>
          ))}

          {row.due && (
            <button
              type="button"
              className="chip small"
              onClick={() => setDate('')}
            >
              {t(ui.tracker.clear)}
            </button>
          )}
        </div>
      )}
    </li>
  )
}

function Tracker({ t, lang, rows, visitDate, setVisitDate, dates, setDates, clockDone, setClockDone }) {
  const has = isIso(visitDate) && visitDate <= todayIso()
  const nDone = rows.filter((r) => r.done).length
  return (
    <>
      <div className="steps-head">
        <h2 className="h2">{t(ui.tracker.title)}</h2>
        {has && rows.length > 0 && <span className="progress num">{nDone}/{rows.length} {t(ui.after.progress)}</span>}
      </div>
      <p className="lead small">{t(ui.tracker.lead)}</p>
      <VisitDateBar t={t} visitDate={visitDate} setVisitDate={setVisitDate} />
      {!has && <p className="hint">{t(ui.tracker.needDate)}</p>}
      {has && (
        <ul className="clocks">
          {rows.map((r) => (
            <ClockRow
              key={r.id}
              row={r}
              t={t}
              lang={lang}
              visitDate={visitDate}
              dates={dates}
              setDates={setDates}
              done={clockDone}
              setDone={setClockDone}
            />
          ))}
        </ul>
      )}
    </>
  )
}

// ---------- screens ----------

function Home({ t, lang, go, rows, notes, noteCount, onDeleteAll }) {
  const [deleted, flashDeleted] = useFlash(2600)
  const open = rows.filter((r) => !r.done)
  const dated = open.filter((r) => r.due).slice(0, 3)
  const pending = open.filter((r) => !r.due).length
  return (
    <section className="screen">
      <h1 className="display">{t(ui.home.title)}</h1>
      <p className="lead">{t(ui.home.lead)}</p>
      {open.length > 0 && (
        <div className="card loops">
          <span className="label">{t(ui.home.loopsTitle)}</span>
          {dated.length > 0 && (
            <ul className="loop-list">
              {dated.map((r) => (
                <li key={r.id}>
                  <span className="loop-label">{t(r.label)}</span>
                  <span className="loop-date num">{r.due}</span>
                  <Badge diff={r.diff} lang={lang} />
                </li>
              ))}
            </ul>
          )}
          {pending > 0 && (
            <p className="muted">
              {pending} {t(pending === 1 ? ui.home.pendingOne : ui.home.pendingMany)}
            </p>
          )}
          <button type="button" className="link" onClick={() => go('after')}>{t(ui.home.loopsMore)} →</button>
        </div>
      )}
      <ol className="route">
        {['before', 'visit', 'after'].map((s) => (
          <li key={s}>
            <button type="button" className="route-stop" onClick={() => go(s)}>
              <span className="route-marker" aria-hidden="true" />
              <span className="route-body">
                <span className="route-title">{t(ui.stages[s].title)}</span>
                <span className="route-q">{t(ui.stages[s].q)}</span>
              </span>
              <span className="route-arrow" aria-hidden="true">→</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="notes-briefs" aria-labelledby="home-notes">
        <div className="steps-head">
          <h2 className="h2" id="home-notes">{t(ui.notes.title)}</h2>
          {noteCount > 0 && <span className="progress num">{noteCount}</span>}
        </div>
        {notes.length === 0 ? (
          <p className="muted">{t(ui.home.notesEmpty)}</p>
        ) : (
          <ul className="brief-list">
            {notes.map((v) => (
              <li key={v.id}>
                <button type="button" className="brief" onClick={() => go('notes')}>
                  <span className="brief-head">
                    <span className="brief-date num">{v.visitDate || t(ui.notes.undated)}</span>
                    {v.current && <span className="badge is-near">{t(ui.home.currentVisit)}</span>}
                  </span>
                  <span className="brief-clinic">{hasText(v.clinic) ? v.clinic : t(ui.notes.noClinic)}</span>
                  <span className="brief-said">{hasText(v.said) ? v.said : t(ui.notes.noText)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="link" onClick={() => go('notes')}>
          <Icon name="notes" /> {t(noteCount > 0 ? ui.home.seeAllNotes : ui.home.notesLink)}
        </button>
      </section>

      <section className="card privacy" aria-labelledby="home-privacy">
        <h2 className="h2 privacy-title" id="home-privacy">
          <Icon name="lock" /> {t(ui.privacy.title)}
        </h2>
        <ul className="privacy-points">
          {ui.privacy.points.map((point) => <li key={point.en}>{t(point)}</li>)}
        </ul>
        <p className="muted">{t(ui.privacy.hosting)}</p>
        <ConfirmButton
          className="btn ghost danger"
          label={t(ui.privacy.deleteAll)}
          confirmLabel={t(ui.privacy.confirmDeleteAll)}
          onConfirm={() => {
            onDeleteAll()
            flashDeleted()
          }}
        />
        <p className="privacy-status" role="status">{deleted ? t(ui.privacy.deleted) : ''}</p>
      </section>
    </section>
  )
}

function Before({ t, lang, go, packed, setPacked }) {
  const [section, setSection] = useState('ask')
  const [copied, flash] = useFlash()
  const [copiedIdx, setCopiedIdx] = useState(-1)

  const opts = ['ask', 'services', 'cost', 'bring'].map((id) => ({ id, label: t(ui.before.sections[id]) }))
  const verified = places.filter((p) => p.verified)

  return (
    <section className="screen">
      <StageRail current="before" t={t} go={go} />
      <h1 className="display">{t(ui.stages.before.title)}</h1>
      <Segmented options={opts} value={section} onChange={setSection} ariaLabel="Before sections" />

      {section === 'ask' && (
        <>
          <p className="lead">{t(ui.before.askLead)}</p>
          <ul className="asks">
            {askClinic.map((q, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="ask"
                  onClick={() => copyText(q.en).then(() => { setCopiedIdx(i); flash() })}
                >
                  <span className="ask-en">{q.en}</span>
                  <span className="ask-zh">{q.zh}</span>
                  <span className="ask-copy">{copied && copiedIdx === i ? t(ui.visit.copied) : <Icon name="copy" />}</span>
                </button>
                <p className="ask-why">{t(q.why)}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {section === 'services' && (
        <>
          <p className="lead">{t(ui.before.servicesLead)}</p>
          <p className="emergency">{t(ui.before.emergency)}</p>
          <ul className="services">
            {services.map((s) => (
              <li key={s.id} className="service">
                <h2>{t(s.name)}</h2>
                <dl>
                  <dt>{t(ui.before.whatLabel)}</dt>
                  <dd>{t(s.what)}</dd>
                  <dt>{t(ui.before.costLabel)}</dt>
                  <dd>{t(s.cost)}</dd>
                  <dt>{t(ui.before.tipLabel)}</dt>
                  <dd>{t(s.tip)}</dd>
                </dl>
              </li>
            ))}
          </ul>
          {verified.length > 0 && (
            <>
              <h2 className="h2">{t(ui.before.nearTitle)}</h2>
              <p className="muted">{t(ui.before.nearLead)}</p>
              <ul className="services">
                {verified.map((p) => (
                  <li key={p.id} className="service">
                    <h2>{p.name}</h2>
                    <dl>
                      <dt>{t(ui.before.whereLabel)}</dt>
                      <dd>{t(p.where)}</dd>
                      <dt>{t(ui.before.billsLabel)}</dt>
                      <dd>{p.directBills === true ? t(ui.before.billsYes) : p.directBills === false ? t(ui.before.billsNo) : t(ui.before.billsAsk)}</dd>
                    </dl>
                    <span className="source">{t(ui.before.verifiedOn)}: {p.verified}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {section === 'cost' && (
        <>
          <p className="lead">{t(ui.before.costLead)}</p>
          <ol className="facts">
            {costFacts.map((f, i) => (
              <li key={i}>
                <p>{t(f.text)}</p>
                <SourceLine source={f.source} t={t} />
              </li>
            ))}
          </ol>
        </>
      )}

      {section === 'bring' && (
        <>
          <p className="lead">{t(ui.before.bringLead)}</p>
          <ul className="checklist">
            {bookingChecklist.map((item) => (
              <li key={item.id}>
                <label className={`check ${packed[item.id] ? 'is-done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!packed[item.id]}
                    onChange={(e) => setPacked({ ...packed, [item.id]: e.target.checked })}
                  />
                  <span className="check-box" aria-hidden="true"><Icon name="check" /></span>
                  <span>{item[lang] ?? item.en}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      <StageNav current="before" t={t} go={go} />
      <TermsLink t={t} go={go} />
    </section>
  )
}

function Visit({ t, go, form, setForm }) {
  const [copied, flash] = useFlash()
  const { translate, cancel, status, busy } = useLocalTranslation()

  const set = (patch) => setForm({ ...form, ...patch, isExample: false })
  const sinceOpt = prep.since.find((o) => o.id === form.since) ?? prep.since[1]
  const trendOpt = prep.trend.find((o) => o.id === form.trend) ?? prep.trend[1]
  const qs = prep.questions.filter((q) => form.questions.includes(q.id))

  const missing = untranslatedFields(form)
  const hasChinese = translationFields.some((field) => containsChinese(form[field]))
  const en = englishCard(form, sinceOpt, trendOpt, qs)

  const zhLine = (label, value) => `${label}：${value}${/[。！？.!?]$/.test(value) ? '' : '。'}`
  const zhLines = [
    zhLine('症状', form.symptom || '…'),
    zhLine('持续时间', sinceOpt.zh),
    `严重程度 0 到 10 分大约 ${form.severity} 分，目前${trendOpt.zh}。`,
    form.tried ? zhLine('已尝试', form.tried) : '',
    qs.length ? `我想问：${qs.map((q) => q.zh).join(' ')}` : '',
  ].filter(Boolean)
  const zh = zhLines.join('')
  const enLines = en.split(/ (?=(?:Duration|Severity|Tried|Questions): )/).map((line) => {
    const match = line.match(/^([A-Za-z]+): ([^]*)$/)
    return match ? { label: match[1], text: match[2] } : { label: '', text: line }
  })

  const toggleQ = (id) => {
    const has = form.questions.includes(id)
    set({ questions: has ? form.questions.filter((x) => x !== id) : [...form.questions, id] })
  }

  const translateInputs = async () => {
    const originals = Object.fromEntries(missing.map((field) => [field, form[field]]))
    try {
      const translated = await translate(originals)
      setForm((current) => applyTranslations(current, originals, translated))
    } catch {
      // The hook presents errors; cancellation and navigation keep existing drafts.
    }
  }

  const englishDraft = (field) => containsChinese(form[field]) && (
    <label className="field translation-draft">
      <span className="label">{t(ui.visit[field === 'symptom' ? 'englishSymptom' : 'englishTried'])}</span>
      <textarea
        rows="2" lang="en" placeholder={t(ui.visit.englishPlaceholder)}
        value={form.translations?.[field]?.source === form[field] ? form.translations[field].text : ''}
        onChange={(event) => {
          const text = event.target.value
          setForm((current) => ({ ...current, translations: { ...current.translations,
            [field]: { source: current[field], text },
          } }))
        }}
      />
    </label>
  )

  return (
    <section className="screen">
      <StageRail current="visit" t={t} go={go} />
      <h1 className="display">{t(ui.visit.title)}</h1>
      <p className="lead">{t(ui.visit.lead)}</p>
      {form.isExample && <p className="hint">{t(ui.visit.example)}</p>}

      <div className="form">
        <label className="field">
          <span className="label">{t(ui.visit.symptom)}</span>
          <input value={form.symptom} placeholder={t(ui.visit.symptomPh)} onChange={(e) => set({ symptom: e.target.value })} />
        </label>
        {englishDraft('symptom')}

        <div className="field">
          <span className="label">{t(ui.visit.since)}</span>
          <div className="chips">
            {prep.since.map((o) => (
              <button key={o.id} type="button" className={`chip ${form.since === o.id ? 'is-on' : ''}`} onClick={() => set({ since: o.id })}>
                {t(o)}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="label">
            {t(ui.visit.severity)} <output className="num">{form.severity}</output>
          </span>
          <input type="range" min="0" max="10" value={form.severity} onChange={(e) => set({ severity: Number(e.target.value) })} />
        </label>

        <div className="field">
          <span className="label">{t(ui.visit.trend)}</span>
          <div className="chips">
            {prep.trend.map((o) => (
              <button key={o.id} type="button" className={`chip ${form.trend === o.id ? 'is-on' : ''}`} onClick={() => set({ trend: o.id })}>
                {t(o)}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="label">{t(ui.visit.tried)}</span>
          <input value={form.tried} placeholder={t(ui.visit.triedPh)} onChange={(e) => set({ tried: e.target.value })} />
        </label>
        {englishDraft('tried')}

        {hasChinese && (
          <div className="translation-panel">
            <p className="muted">{t(ui.visit.translationLead)}</p>
            <div className="actions">
              <button type="button" className="btn" disabled={busy || missing.length === 0} onClick={translateInputs}>
                {t(busy ? ui.visit.translating : missing.length === 0 ? ui.visit.translationReady : ui.visit.translate)}
              </button>
              {busy && <button type="button" className="btn ghost" onClick={cancel}>{t(ui.visit.cancelTranslation)}</button>}
            </div>
            <p className={`translation-status ${status.error ? 'is-error' : ''}`} role="status" aria-live="polite">
              {status.error ? t(ui.visit[status.error === 'tooLong' ? 'translationTooLong' : 'translationFailed'])
                : status.phase === 'loading' ? `${t(ui.visit.loadingModel)}${status.loaded ? ` · ${(status.loaded / 1024 / 1024).toFixed(1)} MB` : ''}`
                  : status.phase === 'translating' ? t(ui.visit.translating)
                    : missing.length === 0 ? t(ui.visit.reviewTranslation) : t(ui.visit.translationPending)}
            </p>
          </div>
        )}

        <div className="field">
          <span className="label">{t(ui.visit.questions)}</span>
          <ul className="checklist compact">
            {prep.questions.map((q) => (
              <li key={q.id}>
                <label className={`check ${form.questions.includes(q.id) ? 'is-done' : ''}`}>
                  <input type="checkbox" checked={form.questions.includes(q.id)} onChange={() => toggleQ(q.id)} />
                  <span className="check-box" aria-hidden="true"><Icon name="check" /></span>
                  <span>{t(q)}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card prep-card">
        <span className="label">{t(ui.visit.showDoctor)}</span>
        <div className="prep-en" lang="en">
          {enLines.map((line, i) => <p key={i}>{line.label && <b>{line.label}</b>}{line.text}</p>)}
        </div>
        <span className="label">{t(ui.visit.forYou)}</span>
        <div className="prep-zh" lang="zh-CN">
          {zhLines.map((line, i) => <p key={i}>{line}</p>)}
        </div>
        <button type="button" className="btn" disabled={missing.length > 0} onClick={() => copyText(`${en}\n\n${zh}`).then(flash)}>
          <Icon name="copy" /> {copied ? t(ui.visit.copied) : t(ui.visit.copy)}
        </button>
        {missing.length > 0 && <p className="muted">{t(ui.visit.copyNeedsTranslation)}</p>}
      </div>
      <p className="tip">{t(ui.visit.tip)}</p>
      <StageNav current="visit" t={t} go={go} />
      <TermsLink t={t} go={go} />
    </section>
  )
}

function After({ t, lang, go, picked, setPicked, hintOff, setHintOff, done, setDone, tracker }) {

  const toggle = (id) => {
    setHintOff(true)
    setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id])
  }
  const chosen = artefacts.filter((a) => picked.includes(a.id))
  const allSteps = chosen.flatMap((a) => a.steps.map((s, i) => ({ ...s, id: `${a.id}-${i}` })))
  const nDone = allSteps.filter((s) => done[s.id]).length

  return (
    <section className="screen">
      <StageRail current="after" t={t} go={go} />
      <h1 className="display">{t(ui.after.title)}</h1>
      <p className="lead">{t(ui.after.lead)}</p>

      <ul className="slips" role="group" aria-label={t(ui.after.title)}>
        {artefacts.map((a) => {
          const on = picked.includes(a.id)
          return (
            <li key={a.id}>
              <button type="button" className={`slip ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggle(a.id)}>
                <span className="slip-mark" aria-hidden="true">{on ? <Icon name="check" /> : null}</span>
                <span className="slip-label">{t(a.label)}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {!hintOff && (
        <p className="hint">
          {t(ui.after.exampleHint)}{' '}
          <button type="button" className="link inline" onClick={() => setHintOff(true)}>{t(ui.after.dismiss)}</button>
        </p>
      )}

      <Tracker t={t} lang={lang} {...tracker} />

      <div className="steps-head">
        <h2 className="h2">{t(ui.after.stepsTitle)}</h2>
        {allSteps.length > 0 && (
          <span className="progress num">{nDone}/{allSteps.length} {t(ui.after.progress)}</span>
        )}
      </div>

      {chosen.length === 0 && <p className="muted">{t(ui.after.empty)}</p>}

      {chosen.map((a) => (
        <div key={a.id} className="step-group">
          <h3 className="label">{t(a.label)}</h3>
          <ol className="steps">
            {a.steps.map((s, i) => {
              const id = `${a.id}-${i}`
              return (
                <li key={id} className={`step ${done[id] ? 'is-done' : ''}`}>
                  <label className="check">
                    <input type="checkbox" checked={!!done[id]} onChange={(e) => setDone({ ...done, [id]: e.target.checked })} />
                    <span className="check-box" aria-hidden="true"><Icon name="check" /></span>
                    <span className="step-body">
                      <OwnerChip owner={s.owner} t={t} />
                      <span className="step-text">{t(s.text)}</span>
                      <SourceLine source={s.source} t={t} />
                    </span>
                  </label>
                </li>
              )
            })}
          </ol>
          {a.id === 'pathology' && <PathologyQuickActions t={t} />}
        </div>
      ))}

      <StageNav current="after" t={t} go={go} />
      <TermsLink t={t} go={go} />
    </section>
  )
}

function Terms({ t, lang }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const needle = q.trim().toLowerCase()
  const list = useMemo(
    () =>
      glossary.filter((g) =>
        !needle || [g.en, g.zh, g.defEn, g.defZh].some((s) => s.toLowerCase().includes(needle)),
      ),
    [needle],
  )
  return (
    <section className="screen">
      <h1 className="display">{t(ui.terms.title)}</h1>
      <p className="lead">{t(ui.terms.lead)}</p>
      <input className="search" type="search" value={q} placeholder={t(ui.terms.search)} onChange={(e) => setQ(e.target.value)} aria-label={t(ui.terms.search)} />
      <p className="muted num">{list.length} {t(ui.terms.count)}</p>
      {list.length === 0 && <p className="muted">{t(ui.terms.none)}</p>}
      <ul className="glossary">
        {list.map((g) => {
          const isOpen = open === g.en
          return (
            <li key={g.en} className={isOpen ? 'is-open' : ''}>
              <button type="button" className="term" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : g.en)}>
                <span className="term-en" lang="en">{g.en}</span>
                <span className="term-zh" lang="zh-CN">{g.zh}</span>
              </button>
              {isOpen && (
                <div className="term-def">
                  <p lang={lang === 'zh' ? 'zh-CN' : 'en'}>{lang === 'zh' ? g.defZh : g.defEn}</p>
                  <p className="muted" lang={lang === 'zh' ? 'en' : 'zh-CN'}>{lang === 'zh' ? g.defEn : g.defZh}</p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Notes({ t, lang, go, picked, done, setDone, note, setNote, rows, visitDate, setVisitDate, visits, startNewVisit, deleteVisit }) {
  const [copied, flashCopied] = useFlash()
  const [started, flashStarted] = useFlash()
  const n = note ?? exampleNote
  const set = (patch) => setNote({ ...n, ...patch, example: false })
  const chosen = artefacts.filter((a) => picked.includes(a.id))
  const open = rows.filter((r) => !r.done && r.due)

  const asText = () => {
    const lines = [
      `${t(ui.tracker.visitDate)}: ${visitDate}`,
      `${t(ui.notes.clinic)}: ${n.clinic}`,
      `${t(ui.notes.said)}: ${n.said}`,
      `${t(ui.notes.comeBack)} ${n.comeBack}`,
      '',
      t(ui.tracker.title),
      ...open.map((r) => `${r.due}  ${t(r.label)}`),
      '',
      t(ui.notes.steps),
      ...chosen.flatMap((a) => a.steps.map((s, i) => `${done[`${a.id}-${i}`] ? '[x]' : '[ ]'} ${t(ui.owners[s.owner])}: ${t(s.text)}`)),
    ]
    return lines.join('\n')
  }

  return (
    <section className="screen">
      <h1 className="display">{t(ui.notes.title)}</h1>
      <p className="lead">{t(ui.notes.lead)}</p>
      <h2 className="h2">{t(ui.notes.current)}</h2>
      {n.example && <p className="hint">{t(ui.notes.example)}</p>}

      <div className="form">
        <VisitDateBar t={t} visitDate={visitDate} setVisitDate={setVisitDate} />
        <label className="field">
          <span className="label">{t(ui.notes.clinic)}</span>
          <input value={n.clinic} onChange={(e) => set({ clinic: e.target.value })} />
        </label>
        <label className="field">
          <span className="label">{t(ui.notes.said)}</span>
          <textarea rows="4" value={n.said} placeholder={t(ui.notes.saidPh)} onChange={(e) => set({ said: e.target.value })} />
        </label>
        <label className="field">
          <span className="label">{t(ui.notes.comeBack)}</span>
          <input value={n.comeBack} placeholder={t(ui.notes.comeBackPh)} onChange={(e) => set({ comeBack: e.target.value })} />
        </label>
      </div>

      {open.length > 0 && (
        <>
          <h2 className="h2">{t(ui.tracker.title)}</h2>
          <ul className="loop-list">
            {open.map((r) => (
              <li key={r.id}>
                <span className="loop-label">{t(r.label)}</span>
                <span className="loop-date num">{r.due}</span>
                <Badge diff={r.diff} lang={lang} />
              </li>
            ))}
          </ul>
          <button type="button" className="link" onClick={() => go('after')}>{t(ui.home.loopsMore)} →</button>
        </>
      )}

      <h2 className="h2">{t(ui.notes.steps)}</h2>
      {chosen.length === 0 && <p className="muted">{t(ui.notes.noSteps)}</p>}
      {chosen.map((a) => (
        <div key={a.id} className="step-group">
          <h3 className="label">{t(a.label)}</h3>
          <ol className="steps">
            {a.steps.map((s, i) => {
              const id = `${a.id}-${i}`
              return (
                <li key={id} className={`step ${done[id] ? 'is-done' : ''}`}>
                  <label className="check">
                    <input type="checkbox" checked={!!done[id]} onChange={(e) => setDone({ ...done, [id]: e.target.checked })} />
                    <span className="check-box" aria-hidden="true"><Icon name="check" /></span>
                    <span className="step-body">
                      <OwnerChip owner={s.owner} t={t} />
                      <span className="step-text">{t(s.text)}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ol>
        </div>
      ))}

      <div className="actions">
        <button type="button" className="btn" onClick={() => copyText(asText()).then(flashCopied)}>
          <Icon name="copy" /> {copied ? t(ui.visit.copied) : t(ui.notes.copy)}
        </button>
        <button type="button" className="btn ghost" onClick={() => { startNewVisit(); flashStarted() }}>
          {started ? t(ui.notes.started) : t(ui.notes.newVisit)}
        </button>
      </div>
      <p className="muted">{t(ui.notes.newVisitHint)}</p>

      <h2 className="h2">{t(ui.notes.earlier)}</h2>
      {visits.length === 0 ? (
        <p className="muted">{t(ui.notes.earlierEmpty)}</p>
      ) : (
        <ul className="visit-records">
          {visits.map((v) => (
            <li key={v.id}>
              <details className="visit-record">
                <summary>
                  <span className="brief-head">
                    <span className="brief-date num">{v.visitDate || t(ui.notes.undated)}</span>
                  </span>
                  <span className="brief-clinic">{hasText(v.clinic) ? v.clinic : t(ui.notes.noClinic)}</span>
                  <span className="brief-said">{hasText(v.said) ? v.said : t(ui.notes.noText)}</span>
                </summary>
                <div className="visit-record-body">
                  {hasText(v.said) && (
                    <div>
                      <span className="label">{t(ui.notes.said)}</span>
                      <p>{v.said}</p>
                    </div>
                  )}
                  {hasText(v.comeBack) && (
                    <div>
                      <span className="label">{t(ui.notes.comeBack)}</span>
                      <p>{v.comeBack}</p>
                    </div>
                  )}
                  {v.picked.length > 0 && (
                    <div>
                      <span className="label">{t(ui.notes.leftWith)}</span>
                      <p>{v.picked.map((id) => t(artefacts.find((a) => a.id === id)?.label)).join(' · ')}</p>
                    </div>
                  )}
                  {v.stepsTotal > 0 && <p className="muted num">{v.stepsDone}/{v.stepsTotal} {t(ui.notes.stepsDone)}</p>}
                  {v.upcoming.length > 0 && (
                    <div>
                      <span className="label">{t(ui.tracker.title)}</span>
                      <ul className="loop-list">
                        {v.upcoming.map((d) => (
                          <li key={`${d.due}-${d.label.en}`}>
                            <span className="loop-label">{t(d.label)}</span>
                            <span className="loop-date num">{d.due}</span>
                            <Badge diff={daysUntil(d.due)} lang={lang} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <ConfirmButton
                    className="btn ghost small danger"
                    label={t(ui.notes.delete)}
                    confirmLabel={t(ui.notes.confirmDelete)}
                    onConfirm={() => deleteVisit(v.id)}
                  />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
      <TermsLink t={t} go={go} />
    </section>
  )
}

// ---------- shell ----------

export default function App() {
  const [lang, setLang] = useStored('wp.lang', 'en')
  const [tab, setTab] = useState('home')
  const [stage, setStage] = useStored('wp.stage', 'before')
  const [visits, setVisits] = useStored('wp.visits', [])
  const [picked, setPicked] = useStored('wp.picked', ['prescription', 'referral'])
  const [afterHintOff, setAfterHintOff] = useStored('wp.afterHintOff', false)
  const [done, setDone] = useStored('wp.done', {})
  const [note, setNote] = useStored('wp.note', null)
  const [visitDate, setVisitDate] = useStored('wp.visitDate', '')
  const [dates, setDates] = useStored('wp.dates', {})
  const [clockDone, setClockDone] = useStored('wp.clockDone', {})
  const [prepForm, setPrepForm] = useStored('wp.prep', { ...prep.example, isExample: true })
  const [packed, setPacked] = useStored('wp.packed', {})

  const t = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] ?? o.en ?? ''))

  const rows = useMemo(
    () => buildClocks({ picked, visitDate, dates, done: clockDone }),
    [picked, visitDate, dates, clockDone],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
    document.querySelector('.app')?.scrollTo(0, 0)
  }, [tab])

  const stages = ['before', 'visit', 'after']
  const go = (next) => {
    if (stages.includes(next)) setStage(next)
    setTab(next)
  }
  const tabs = [
    { id: 'home', icon: 'home', label: ui.tabs.home, target: 'home', on: tab === 'home' },
    { id: 'guide', icon: 'guide', label: ui.tabs.guide, target: stages.includes(stage) ? stage : 'before', on: stages.includes(tab) },
    { id: 'notes', icon: 'notes', label: ui.tabs.notes, target: 'notes', on: tab === 'notes' },
  ]

  const resetCurrent = () => {
    setNote({ example: false, clinic: '', said: '', comeBack: '' })
    setDone({})
    setPicked([])
    setVisitDate('')
    setDates({})
    setClockDone({})
    setPrepForm({ symptom: '', since: 'today', severity: 0, trend: 'same', tried: '', questions: [], isExample: false, translations: {} })
    setPacked({})
    setAfterHintOff(true)
  }

  const current = visitSummary({ note, visitDate, picked, picksAreExample: !afterHintOff, done, rows })
  const currentHasContent = [current.clinic, current.said, current.comeBack].some(hasText) || current.visitDate !== ''
  const startNewVisit = () => {
    if (currentHasContent) {
      setVisits((list) => [{ id: Date.now().toString(36), savedAt: new Date().toISOString(), ...current }, ...list])
    }
    resetCurrent()
  }
  const deleteVisit = (id) => setVisits((list) => list.filter((v) => v.id !== id))
  const deleteAll = () => {
    setVisits([])
    resetCurrent()
  }
  const noteList = [...(currentHasContent ? [{ id: 'current', current: true, ...current }] : []), ...visits]

  const tracker = { rows, visitDate, setVisitDate, dates, setDates, clockDone, setClockDone }

  let screen
  if (tab === 'home') screen = <Home t={t} lang={lang} go={go} rows={rows} notes={noteList.slice(0, 3)} noteCount={noteList.length} onDeleteAll={deleteAll} />
  else if (tab === 'before') screen = <Before t={t} lang={lang} go={go} packed={packed} setPacked={setPacked} />
  else if (tab === 'visit') screen = <Visit t={t} go={go} form={prepForm} setForm={setPrepForm} />
  else if (tab === 'after') screen = <After t={t} lang={lang} go={go} picked={picked} setPicked={setPicked} hintOff={afterHintOff} setHintOff={setAfterHintOff} done={done} setDone={setDone} tracker={tracker} />
  else if (tab === 'terms') screen = <Terms t={t} lang={lang} />
  else screen = <Notes t={t} lang={lang} go={go} picked={picked} done={done} setDone={setDone} note={note} setNote={setNote} rows={rows} visitDate={visitDate} setVisitDate={setVisitDate} visits={visits} startNewVisit={startNewVisit} deleteVisit={deleteVisit} />

  return (
    <div className="app" lang={lang === 'zh' ? 'zh-CN' : 'en-AU'}>
      <header className="top">
        <button type="button" className="brand" onClick={() => go('home')} aria-label="Waypoint home">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">{t(ui.appName)}</span>
          <span className="brand-tag">{t(ui.tagline)}</span>
        </button>
        <div className="lang" role="group" aria-label="Language">
          <button type="button" aria-pressed={lang === 'en'} className={lang === 'en' ? 'is-on' : ''} onClick={() => setLang('en')}>EN</button>
          <button type="button" aria-pressed={lang === 'zh'} className={lang === 'zh' ? 'is-on' : ''} onClick={() => setLang('zh')} lang="zh-CN">中文</button>
        </div>
      </header>

      <main key={tab}>{screen}</main>

      <footer className="foot">
        <p>{t(ui.footer.disclaimer)}</p>
        <p className="muted">{t(ui.footer.sources)} {CONTENT_DATE}. {t(ui.prototype)}.</p>
      </footer>

      <nav className="tabbar" aria-label="Sections">
        {tabs.map((item) => (
          <button key={item.id} type="button" className={item.on ? 'is-on' : ''} aria-current={item.on ? 'page' : undefined} onClick={() => go(item.target)}>
            <Icon name={item.icon} />
            <span>{t(item.label)}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
