import { useEffect, useMemo, useState } from 'react'
import {
  CONTENT_DATE,
  artefacts,
  askClinic,
  bookingChecklist,
  costFacts,
  exampleNote,
  glossary,
  prep,
  services,
  sources,
  ui,
} from './content.js'

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
  return (
    <span className="source">
      {t(ui.after.sourceLabel)}: {t(sources[source])}
    </span>
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

// ---------- screens ----------

function Home({ t, go }) {
  return (
    <section className="screen">
      <h1 className="display">{t(ui.home.title)}</h1>
      <p className="lead">{t(ui.home.lead)}</p>
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
      <div className="quiet-links">
        <button type="button" className="link" onClick={() => go('notes')}>
          <Icon name="notes" /> {t(ui.home.notesLink)}
        </button>
        <button type="button" className="link" onClick={() => go('terms')}>
          <Icon name="terms" /> {t(ui.home.termsLink)}
        </button>
      </div>
    </section>
  )
}

function Before({ t, lang, go }) {
  const [section, setSection] = useStored('wp.before', 'services')
  const [packed, setPacked] = useStored('wp.packed', {})
  const [copied, flash] = useFlash()
  const [copiedIdx, setCopiedIdx] = useState(-1)

  const opts = ['services', 'cost', 'booking'].map((id) => ({ id, label: t(ui.before.sections[id]) }))

  return (
    <section className="screen">
      <StageRail current="before" t={t} go={go} />
      <h1 className="display">{t(ui.stages.before.title)}</h1>
      <Segmented options={opts} value={section} onChange={setSection} ariaLabel="Before sections" />

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
          <h2 className="h2">{t(ui.before.askTitle)}</h2>
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
              </li>
            ))}
          </ul>
        </>
      )}

      {section === 'booking' && (
        <>
          <p className="lead">{t(ui.before.bookingLead)}</p>
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
    </section>
  )
}

function Visit({ t, go }) {
  const [form, setForm] = useStored('wp.prep', { ...prep.example, isExample: true })
  const [copied, flash] = useFlash()

  const set = (patch) => setForm({ ...form, ...patch, isExample: false })
  const sinceOpt = prep.since.find((o) => o.id === form.since) ?? prep.since[1]
  const trendOpt = prep.trend.find((o) => o.id === form.trend) ?? prep.trend[1]
  const qs = prep.questions.filter((q) => form.questions.includes(q.id))

  const en = [
    `I've had ${form.symptom || '…'} ${sinceOpt.en}.`,
    `On a scale of 0 to 10 it's about ${form.severity}, and it's ${trendOpt.en}.`,
    form.tried ? `I've tried ${form.tried}.` : '',
    qs.length ? `I have some questions. ${qs.map((q) => q.en).join(' ')}` : '',
  ].filter(Boolean).join(' ')

  const zh = [
    `我${sinceOpt.zhSentence}${form.symptom || '…'}。`,
    `严重程度 0 到 10 分大约 ${form.severity} 分，目前${trendOpt.zh}。`,
    form.tried ? `我试过：${form.tried}。` : '',
    qs.length ? `我想问：${qs.map((q) => q.zh).join(' ')}` : '',
  ].filter(Boolean).join('')

  const toggleQ = (id) => {
    const has = form.questions.includes(id)
    set({ questions: has ? form.questions.filter((x) => x !== id) : [...form.questions, id] })
  }

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
        <p className="prep-en" lang="en">{en}</p>
        <span className="label">{t(ui.visit.forYou)}</span>
        <p className="prep-zh" lang="zh-CN">{zh}</p>
        <button type="button" className="btn" onClick={() => copyText(`${en}\n\n${zh}`).then(flash)}>
          <Icon name="copy" /> {copied ? t(ui.visit.copied) : t(ui.visit.copy)}
        </button>
      </div>
      <p className="tip">{t(ui.visit.tip)}</p>
    </section>
  )
}

function After({ t, go, picked, setPicked, done, setDone }) {
  const [hintOff, setHintOff] = useStored('wp.afterHintOff', false)
  const [saved, flash] = useFlash()

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
        </div>
      ))}

      {chosen.length > 0 && (
        <button type="button" className="btn" onClick={() => { flash(); go('notes') }}>
          <Icon name="notes" /> {saved ? t(ui.after.saved) : t(ui.after.saveNotes)}
        </button>
      )}
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

function Notes({ t, picked, done, setDone, note, setNote }) {
  const [copied, flashCopied] = useFlash()
  const [cleared, flashCleared] = useFlash()
  const n = note ?? exampleNote
  const set = (patch) => setNote({ ...n, ...patch, example: false })
  const chosen = artefacts.filter((a) => picked.includes(a.id))

  const asText = () => {
    const lines = [
      `${t(ui.notes.date)}: ${n.date}`,
      `${t(ui.notes.clinic)}: ${n.clinic}`,
      `${t(ui.notes.said)}: ${n.said}`,
      `${t(ui.notes.comeBack)} ${n.comeBack}`,
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
      {n.example && <p className="hint">{t(ui.notes.example)}</p>}

      <div className="form">
        <label className="field">
          <span className="label">{t(ui.notes.date)}</span>
          <input type="date" value={n.date} onChange={(e) => set({ date: e.target.value })} />
        </label>
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
        <button
          type="button"
          className="btn ghost"
          onClick={() => { setNote({ example: false, date: '', clinic: '', said: '', comeBack: '' }); setDone({}); flashCleared() }}
        >
          {cleared ? t(ui.notes.cleared) : t(ui.notes.clear)}
        </button>
      </div>
    </section>
  )
}

// ---------- shell ----------

export default function App() {
  const [lang, setLang] = useStored('wp.lang', 'en')
  const [tab, setTab] = useState('home')
  const [picked, setPicked] = useStored('wp.picked', ['prescription', 'referral'])
  const [done, setDone] = useStored('wp.done', {})
  const [note, setNote] = useStored('wp.note', null)

  const t = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] ?? o.en ?? ''))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  const go = (next) => setTab(next)
  const tabs = ['home', 'before', 'visit', 'after', 'terms']

  let screen
  if (tab === 'home') screen = <Home t={t} go={go} />
  else if (tab === 'before') screen = <Before t={t} lang={lang} go={go} />
  else if (tab === 'visit') screen = <Visit t={t} go={go} />
  else if (tab === 'after') screen = <After t={t} go={go} picked={picked} setPicked={setPicked} done={done} setDone={setDone} />
  else if (tab === 'terms') screen = <Terms t={t} lang={lang} />
  else screen = <Notes t={t} picked={picked} done={done} setDone={setDone} note={note} setNote={setNote} />

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
        {tabs.map((id) => (
          <button key={id} type="button" className={tab === id ? 'is-on' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>
            <Icon name={id} />
            <span>{t(ui.tabs[id])}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
