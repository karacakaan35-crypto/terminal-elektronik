import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  BatteryCharging,
  BookOpenCheck,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Cpu,
  Download,
  ExternalLink,
  Flame,
  Gauge,
  History,
  KeyRound,
  Layers3,
  LockKeyhole,
  MessageCircle,
  NotebookPen,
  PhoneCall,
  PlugZap,
  Power,
  Radar,
  RotateCcw,
  Search,
  ShieldAlert,
  Send,
  Sparkles,
  Square,
  TerminalSquare,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react'
import diagnostics from '../data/diagnostics.json'
import { assistantGreeting, assistantQuickPrompts, generateAssistantReply } from '../utils/assistantBrain'
import { evaluateMeasurement } from '../utils/ruleEvaluator'
import { applyScoreDelta, createInitialScores, getFaultCandidates, getRiskLabel } from '../utils/scoringEngine'

const deviceIcons = {
  ups: BatteryCharging,
  barrier: Radar,
  fire_panel: Flame,
  cctv: Camera,
  access: LockKeyhole,
  uvis: Camera,
  pbx: PhoneCall,
  sliding: Radar,
  support: PlugZap,
  general: Cpu,
}

const dangerStyles = {
  low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
  medium: 'border-amber-300/40 bg-amber-400/10 text-amber-100',
  high: 'border-red-300/50 bg-red-500/10 text-red-100',
}

const severityStyles = {
  critical: 'border-red-400/50 bg-red-500/10 text-red-100',
  warning: 'border-amber-300/50 bg-amber-400/10 text-amber-100',
  info: 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100',
}

const nodeTypeLabels = {
  symptom: 'Belirti Seçimi',
  measurement: 'Ölçüm',
  question_boolean: 'Kontrol Sorusu',
  inspection: 'Görsel Kontrol',
  component_test: 'Parça Testi',
  result: 'Teşhis Sonucu',
}

const dangerLabels = {
  low: 'Düşük',
  medium: 'Dikkat',
  high: 'Yüksek',
}

const meterModeLabels = {
  'DC Voltage': 'DC Voltaj',
  'AC Voltage': 'AC Voltaj',
  'AC/DC Voltage': 'AC/DC Voltaj',
  Ohm: 'Direnç / Ohm',
  Resistance: 'Direnç / Ohm',
  'Diode Mode': 'Diyot Modu',
  Continuity: 'Süreklilik',
  'Oscilloscope / RS-485 analyzer': 'Osiloskop / RS-485 Analizörü',
}

const evidenceLabels = {
  manufacturer: { label: 'Üretici bilgisi', tone: 'emerald' },
  standard: { label: 'Standart bilgisi', tone: 'cyan' },
  engineering: { label: 'Ölçüm rehberi', tone: 'amber' },
  heuristic: { label: 'Genel servis kontrolü', tone: 'red' },
}

const defaultAssistantModel = 'gemini-3.1-flash-lite'

function formatAssistantModel(model = defaultAssistantModel) {
  if (model === 'gemini-3.1-flash-lite') {
    return 'Gemini 3.1 Flash-Lite'
  }

  if (model.startsWith('gemma4:e2b')) {
    return 'Gemma 4 E2B'
  }

  if (model.startsWith('gemma4:e4b') || model === 'gemma4') {
    return 'Gemma 4 E4B'
  }

  return model
}

const diagnosticDraftKey = 'terminal-elektronik-active-diagnostic'

const defaultSymptom = diagnostics.deviceProfiles.find((profile) => profile.id === 'ups')?.commonSymptoms[0] || ''

const emptyServiceInfo = {
  customer: '',
  model: '',
  serial: '',
  technician: '',
  complaint: '',
  symptom: defaultSymptom,
}

function getNode(id) {
  return diagnostics.nodes[id]
}

function getInitialScores(profileId) {
  return createInitialScores(profileId, diagnostics.faultPriorScores)
}

function rebuildScores(profileId, entries = []) {
  return entries.reduce(
    (nextScores, entry) => applyScoreDelta(nextScores, entry.scoreDelta),
    getInitialScores(profileId),
  )
}

function loadDiagnosticDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(diagnosticDraftKey) || 'null')
    const profileExists = diagnostics.deviceProfiles.some((profile) => profile.id === parsed?.selectedProfileId)
    const nodeExists = !parsed?.currentNodeId || Boolean(getNode(parsed.currentNodeId))

    if (!parsed || parsed.version !== diagnostics.version || !profileExists || !nodeExists) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function collectScoreIdsFrom(value, ids = new Set()) {
  if (!value || typeof value !== 'object') {
    return ids
  }

  if (value.scoreDelta) {
    Object.keys(value.scoreDelta).forEach((id) => ids.add(id))
  }

  if (value.scoreYes) {
    Object.keys(value.scoreYes).forEach((id) => ids.add(id))
  }

  if (value.scoreNo) {
    Object.keys(value.scoreNo).forEach((id) => ids.add(id))
  }

  if (value.scoreUnknown) {
    Object.keys(value.scoreUnknown).forEach((id) => ids.add(id))
  }

  Object.values(value).forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((item) => collectScoreIdsFrom(item, ids))
    } else if (child && typeof child === 'object') {
      collectScoreIdsFrom(child, ids)
    }
  })

  return ids
}

function getProfileFaultIds(profileId) {
  if (!profileId) {
    return []
  }

  const ids = new Set()

  Object.values(diagnostics.nodes).forEach((node) => {
    if (node.device === profileId) {
      collectScoreIdsFrom(node, ids)
    }
  })

  return [...ids]
}

function classNames(...values) {
  return values.filter(Boolean).join(' ')
}

function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function IconButton({ children, icon: Icon, className, ...props }) {
  return (
    <button
      type="button"
      className={classNames(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

function Badge({ children, tone = 'zinc' }) {
  const tones = {
    zinc: 'border-zinc-700 bg-zinc-900 text-zinc-300',
    emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-300/40 bg-amber-400/10 text-amber-100',
    red: 'border-red-300/40 bg-red-500/10 text-red-100',
    cyan: 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100',
  }

  return (
    <span className={classNames('inline-flex items-center rounded border px-2.5 py-1 font-mono text-xs', tones[tone])}>
      {children}
    </span>
  )
}

function DeviceIcon({ profile, className = 'h-6 w-6' }) {
  const Icon = deviceIcons[profile.id] || Cpu
  return <Icon className={className} aria-hidden="true" />
}

function ProbabilityBar({ item, compact = false }) {
  return (
    <div className={compact ? 'space-y-1' : 'rounded-md border border-white/10 bg-white/5 p-3'}>
      <div className="flex items-start justify-between gap-3">
        <div className={classNames('font-semibold leading-5 text-zinc-200', compact ? 'text-xs' : 'text-sm')}>{item.label}</div>
        <div className={classNames('shrink-0 font-mono font-black text-amber-100', compact ? 'text-xs' : 'text-lg')}>{item.probability} puan</div>
      </div>
      <div className={classNames('overflow-hidden rounded-full bg-black/30', compact ? 'mt-1 h-1.5' : 'mt-2 h-2')}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-rose-400"
          style={{ width: `${item.probability}%` }}
        />
      </div>
      {!compact && item.basis ? <p className="mt-2 text-xs leading-5 text-zinc-500">{item.basis}</p> : null}
    </div>
  )
}

function FaultPriorPanel({ profile, compact = false, limit }) {
  const priors = profile?.faultPriors || []
  const visiblePriors = limit ? priors.slice(0, limit) : priors

  if (visiblePriors.length === 0) {
    return null
  }

  return (
    <div className={compact ? 'mt-4 space-y-2' : 'space-y-3'}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-zinc-500">
          <Gauge className="h-4 w-4 text-amber-200" aria-hidden="true" />
          Başlangıç Servis Ağırlıkları
        </div>
        {!compact ? <Badge tone="amber">NORMALİZE 100</Badge> : null}
      </div>
      <div className="space-y-2">
        {visiblePriors.map((item) => (
          <ProbabilityBar key={item.label} item={item} compact={compact} />
        ))}
      </div>
      {!compact ? <p className="text-xs leading-5 text-zinc-500">{diagnostics.probabilityDisclaimer}</p> : null}
    </div>
  )
}

function ServiceIntake({ setServiceInfo, selectedProfileId, setSelectedProfileId, onStart }) {
  const [query, setQuery] = useState('')
  const selectedProfile = diagnostics.deviceProfiles.find((profile) => profile.id === selectedProfileId) || diagnostics.deviceProfiles[0]
  const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR')
  const visibleProfiles = diagnostics.deviceProfiles.filter((profile) => {
    if (!normalizedQuery) {
      return true
    }

    return [
      profile.name,
      profile.shortName,
      profile.description,
      ...(profile.commonSymptoms || []),
      ...(profile.faultPriors || []).map((prior) => prior.label),
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('tr-TR')
      .includes(normalizedQuery)
  })

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-7xl place-items-center px-4 pb-40 pt-8 sm:px-6">
      <div className="w-full space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-rose-300/30 bg-white/5 px-3 py-2 font-mono text-xs text-rose-100">
              <TerminalSquare className="h-4 w-4" aria-hidden="true" />
              SAHA SERVIS KONSOLU
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-normal text-white sm:text-5xl">
              Terminal <span className="gradient-word">Elektronik</span>
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
              UPS, CACS, yangın paneli, kamera, bariyer ve santral arızalarını multimetre, bilgisayar ve sağlam deneme kablolarıyla adım adım kontrol eder.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="cyan">{Object.keys(diagnostics.sourceCatalog).length} TEKNİK KAYNAK</Badge>
              <Badge tone="amber">AĞIRLIKLAR KALİBRE DEĞİL</Badge>
              <Badge tone="emerald">İNCELEME {diagnostics.researchAudit?.reviewedAt}</Badge>
            </div>
            {diagnostics.fieldMode?.enabled ? (
              <div className="mt-4 max-w-4xl rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                <div className="text-sm font-black text-cyan-50">Bu sürüm elinizdeki saha araçlarına göre hazırlandı</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {diagnostics.fieldMode.tools.map((tool) => (
                    <span key={tool} className="rounded border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                      {tool}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-amber-100">{diagnostics.fieldMode.note}</p>
              </div>
            ) : null}
          </div>

          <div className="glass-panel rounded-lg p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
                <DeviceIcon profile={selectedProfile} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-wide text-zinc-500">Seçili modül</div>
                <div className="truncate text-lg font-black text-white">{selectedProfile?.name || 'Modül seç'}</div>
              </div>
            </div>
            <p className="text-sm leading-6 text-zinc-400">{selectedProfile?.description}</p>
            <button
              type="button"
              onClick={() => selectedProfile?.supported && onStart(selectedProfile)}
              disabled={!selectedProfile?.supported}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-rose-300/45 bg-gradient-to-r from-rose-500/25 via-amber-400/15 to-cyan-400/20 px-4 text-sm font-black text-white transition hover:border-rose-200 disabled:opacity-50"
            >
              Hızlı Başlat
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-lg p-5">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Cihaz Profili Seç</h2>
              <p className="mt-1 text-sm text-zinc-500">Cihazı seç, belirtiyi işaretle, ölçüme başla.</p>
            </div>
            <label className="relative block w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="UPS, CACS, kamera, bariyer ara..."
                className="form-control min-h-11 w-full rounded-md pl-10 pr-3 text-sm font-semibold text-zinc-100 outline-none placeholder:text-zinc-600"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleProfiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  if (profile.supported) {
                    setSelectedProfileId(profile.id)
                    setServiceInfo((previous) => ({ ...previous, symptom: profile.commonSymptoms[0] }))
                    onStart(profile)
                  }
                }}
                disabled={!profile.supported}
                className={classNames(
                  'module-card min-h-44 rounded-lg p-4 pl-5 text-left transition hover:-translate-y-0.5 hover:border-rose-300/50',
                  selectedProfileId === profile.id && 'module-card-active',
                  !profile.supported && 'opacity-55',
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/10 bg-white/5 text-rose-100">
                    <DeviceIcon profile={profile} />
                  </div>
                  <Badge tone={profile.supported ? 'emerald' : 'zinc'}>{profile.supported ? 'AKTIF' : 'HAZIRLANIYOR'}</Badge>
                </div>
                <h3 className="text-lg font-black text-white">{profile.name}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{profile.description}</p>
                <FaultPriorPanel profile={profile} compact limit={3} />
                <div className="mt-4 flex items-center gap-2 text-sm font-bold text-rose-100">
                  Teşhisi başlat
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>

          {visibleProfiles.length === 0 ? (
            <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 p-5 text-sm font-semibold text-amber-100">
              Bu aramada modül bulunamadı. Cihaz adını daha kısa yazmayı dene.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Header({ selectedProfile, currentNode, onBack, onReset }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0d1018]/82 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-rose-300/30 bg-gradient-to-br from-rose-500/25 via-amber-400/15 to-cyan-400/20 text-rose-100">
            <BrainCircuit className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-white">{diagnostics.appName}</div>
            <div className="truncate font-mono text-xs text-zinc-500">
              {selectedProfile?.name || 'Profil yok'} / {currentNode?.category || nodeTypeLabels[currentNode?.type] || 'Teşhis'}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <IconButton
            icon={ArrowLeft}
            onClick={onBack}
            aria-label="Bir önceki adıma dön"
            title="Geri"
            className="border-white/10 bg-white/5 text-zinc-200 hover:border-rose-300/60 hover:text-rose-100"
          >
            <span className="hidden sm:inline">Geri</span>
          </IconButton>
          <IconButton
            icon={RotateCcw}
            onClick={onReset}
            aria-label="Yeni teşhis başlat"
            title="Yeni teşhis"
            className="border-white/10 bg-white/5 text-zinc-200 hover:border-cyan-300/60 hover:text-cyan-100"
          >
            <span className="hidden sm:inline">Yeni Teşhis</span>
          </IconButton>
        </div>
      </div>
    </header>
  )
}

function Sidebar({ selectedProfile, serviceInfo, history }) {
  return (
    <aside className="space-y-4">
      <section className="soft-panel rounded-lg p-4">
        <div className="mb-4 flex items-center gap-3">
          {selectedProfile ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-rose-300/30 bg-rose-400/10 text-rose-100">
              <DeviceIcon profile={selectedProfile} />
            </div>
          ) : null}
          <div>
            <h2 className="text-sm font-black text-white">{selectedProfile?.name || 'Cihaz seçilmedi'}</h2>
            <p className="text-xs text-zinc-500">Aktif prosedür</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <InfoRow label="Belirti" value={serviceInfo.symptom || '-'} />
          <InfoRow label="Durum" value="Aktif teşhis" />
        </div>
      </section>

      <section className="soft-panel rounded-lg p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <History className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            İşlem Geçmişi
          </div>
          <Badge>{history.length}</Badge>
        </div>

        <div className="max-h-[46vh] space-y-3 overflow-auto pr-1">
          {history.length === 0 ? (
            <p className="text-sm leading-6 text-zinc-500">Henüz ölçüm veya karar kaydı yok.</p>
          ) : (
            history.map((entry, index) => (
              <div key={`${entry.fromId}-${index}`} className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-500">#{index + 1}</span>
                  <span className="font-mono text-xs text-zinc-600">{entry.time}</span>
                </div>
                <div className="text-sm font-bold text-zinc-200">{entry.title}</div>
                <div className="mt-1 text-sm text-emerald-200">{entry.answer}</div>
                {entry.interpretation ? <div className="mt-1 text-xs leading-5 text-zinc-500">{entry.interpretation}</div> : null}
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[82px_1fr] gap-2 border-b border-zinc-900 pb-2 last:border-b-0 last:pb-0">
      <span className="text-xs text-zinc-600">{label}</span>
      <span className="min-w-0 truncate text-xs font-semibold text-zinc-300">{value}</span>
    </div>
  )
}

function ScorePanel({ selectedProfile, candidates, resultNode, notes, setNotes }) {
  return (
    <aside className="space-y-4">
      <section className="soft-panel rounded-lg p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-white">Başlangıç Servis Ağırlıkları</div>
            <div className="mt-1 text-xs text-zinc-500">{selectedProfile?.shortName || 'Cihaz'} için kalibre edilmemiş öncelik</div>
          </div>
          <Badge tone="amber">OLASILIK DEĞİL</Badge>
        </div>
        <FaultPriorPanel profile={selectedProfile} />
      </section>

      <section className="soft-panel rounded-lg p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Gauge className="h-4 w-4 text-amber-300" aria-hidden="true" />
            Canlı Kanıt Dağılımı
          </div>
          <Badge tone="amber">NORMALİZE</Badge>
        </div>

        <div className="space-y-3">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-sm font-bold leading-5 text-zinc-100">{candidate.label}</div>
                <div className="font-mono text-lg font-black text-amber-100">%{candidate.probability} pay</div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/30">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400" style={{ width: `${candidate.probability}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-500">
                <span>{candidate.componentGroup}</span>
                <span>{getRiskLabel(candidate.risk)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="soft-panel rounded-lg p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
          <NotebookPen className="h-4 w-4 text-cyan-200" aria-hidden="true" />
          Teknisyen Notları
        </div>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Değişen parça, ölçüm ayrıntısı, müşteri notu..."
          rows={6}
          className="form-control w-full resize-none rounded-md px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600"
        />
      </section>

      {resultNode ? (
        <section className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4">
          <div className="mb-2 text-sm font-black text-emerald-100">Son Doğrulama</div>
          <p className="text-sm leading-6 text-zinc-300">{resultNode.verification}</p>
        </section>
      ) : null}
    </aside>
  )
}

function AssistantAvatar({ size = 'md' }) {
  const sizes = {
    md: 'h-14 w-14 rounded-xl sm:h-24 sm:w-24 sm:rounded-2xl',
    lg: 'h-20 w-20 rounded-xl sm:h-32 sm:w-32 sm:rounded-2xl',
  }

  return (
    <div className={classNames('relative shrink-0 overflow-hidden border border-cyan-200/30 bg-[#0a0d14] shadow-[0_0_34px_rgba(34,211,238,0.22)]', sizes[size])}>
      <img src="/astra-portrait-v2.png" alt="Astra anime teknisyen portresi" className="h-full w-full object-cover object-[50%_28%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-transparent to-cyan-100/5" />
      <Sparkles className="absolute right-2 top-2 h-4 w-4 text-cyan-100 drop-shadow" aria-hidden="true" />
    </div>
  )
}

function AssistantWidget({ selectedProfile, currentNode, history, candidates }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [mode, setMode] = useState('fast')
  const [modelStatus, setModelStatus] = useState({ checked: false, available: false, model: defaultAssistantModel })
  const requestControllerRef = useRef(null)
  const activeResponseIdRef = useRef(null)
  const [messages, setMessages] = useState([
    {
      id: 'astra-greeting',
      role: 'assistant',
      text: assistantGreeting,
      source: 'HIZLI',
    },
  ])

  useEffect(() => {
    if (!open) {
      return
    }

    let active = true
    const checkModel = () => {
      fetch('/api/assistant/status', { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Assistant status HTTP ${response.status}`)
          }
          return response.json()
        })
        .then((status) => {
          if (active) {
            setModelStatus({
              checked: true,
              available: Boolean(status.connected && status.modelAvailable),
              model: status.configuredModel || defaultAssistantModel,
            })
          }
        })
        .catch(() => {
          if (active) {
            setModelStatus((previous) => ({ ...previous, checked: true, available: false }))
          }
        })
    }

    checkModel()
    const interval = window.setInterval(checkModel, 15_000)
    window.addEventListener('focus', checkModel)
    document.addEventListener('visibilitychange', checkModel)

    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('focus', checkModel)
      document.removeEventListener('visibilitychange', checkModel)
    }
  }, [open])

  useEffect(() => () => requestControllerRef.current?.abort(), [])

  function upsertAssistantMessage(id, text, source) {
    setMessages((previous) => {
      const messageIndex = previous.findIndex((message) => message.id === id)
      const nextMessage = { id, role: 'assistant', text, source }

      if (messageIndex === -1) {
        return [...previous, nextMessage]
      }

      return previous.map((message, index) => (index === messageIndex ? nextMessage : message))
    })
  }

  async function getLocalModelReply(cleanText, responseId, controller) {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message: cleanText,
        context: {
          selectedProfile: selectedProfile
            ? {
                id: selectedProfile.id,
                name: selectedProfile.name,
                faultPriors: selectedProfile.faultPriors,
              }
            : null,
          currentNode: currentNode
            ? {
                id: currentNode.id,
                type: currentNode.type,
                title: currentNode.title,
                prompt: currentNode.prompt,
                category: currentNode.category,
                expected: currentNode.expected,
                unit: currentNode.unit,
                meterMode: currentNode.meterMode,
                powerState: currentNode.powerState,
                probeBlack: currentNode.probeBlack,
                probeRed: currentNode.probeRed,
                testSteps: currentNode.testSteps,
                stopConditions: currentNode.stopConditions,
              }
            : null,
          history: history.slice(-8),
          candidates: candidates.slice(0, 6),
        },
      }),
    })

    if (!response.ok) {
      setModelStatus((previous) => ({ ...previous, checked: true, available: false }))
      throw new Error(`Assistant model HTTP ${response.status}`)
    }

    const modelName = response.headers.get('X-Assistant-Model') || modelStatus.model || defaultAssistantModel
    const modelLabel = formatAssistantModel(modelName)
    const reader = response.body?.getReader()
    if (!reader) {
      const text = await response.text()
      upsertAssistantMessage(responseId, text, modelLabel)
      return text
    }

    const decoder = new TextDecoder()
    let reply = ''

    while (true) {
      const { done, value } = await reader.read()
      reply += decoder.decode(value || new Uint8Array(), { stream: !done })

      if (reply) {
        upsertAssistantMessage(responseId, reply, modelLabel)
      }

      if (done) {
        break
      }
    }

    if (!reply.trim()) {
      throw new Error('Assistant model returned an empty reply')
    }

    return reply
  }

  async function submitMessage(text = input) {
    const cleanText = text.trim()

    if (!cleanText || isThinking) {
      return
    }

    const responseId = `astra-${Date.now()}-${Math.random().toString(16).slice(2)}`
    setMessages((previous) => [
      ...previous,
      { id: `user-${responseId}`, role: 'user', text: cleanText },
    ])
    setInput('')
    setOpen(true)

    if (mode === 'fast') {
      const reply = generateAssistantReply(cleanText, {
        selectedProfile,
        currentNode,
        history,
        candidates,
      })
      upsertAssistantMessage(responseId, reply, 'HIZLI')
      return
    }

    setIsThinking(true)
    const controller = new AbortController()
    requestControllerRef.current = controller
    activeResponseIdRef.current = responseId

    try {
      await getLocalModelReply(cleanText, responseId, controller)
    } catch (error) {
      if (error?.name === 'AbortError') {
        upsertAssistantMessage(responseId, 'Derin yanıt durduruldu.', 'DURDURULDU')
        return
      }

      const reply = generateAssistantReply(cleanText, {
        selectedProfile,
        currentNode,
        history,
        candidates,
      })

      upsertAssistantMessage(responseId, `${reply}\n\nDerin model yanıt vermedi; hızlı yanıt gösterildi.`, 'HIZLI YEDEK')
    } finally {
      if (activeResponseIdRef.current === responseId) {
        requestControllerRef.current = null
        activeResponseIdRef.current = null
        setIsThinking(false)
      }
    }
  }

  function stopAssistantReply() {
    requestControllerRef.current?.abort()
    if (activeResponseIdRef.current) {
      upsertAssistantMessage(activeResponseIdRef.current, 'Derin yanıt durduruldu.', 'DURDURULDU')
    }
    setIsThinking(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      {open ? (
        <section className="assistant-panel w-[min(480px,calc(100vw-2rem))] overflow-hidden rounded-lg">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/5 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <AssistantAvatar size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-base font-black text-white">
                  Astra
                  <Badge tone="cyan">{messages.at(-1)?.source || (mode === 'deep' ? formatAssistantModel(modelStatus.model) : 'HIZLI')}</Badge>
                </div>
                <p className="truncate text-xs text-zinc-500">
                  {modelStatus.checked
                    ? modelStatus.available
                      ? `${formatAssistantModel(modelStatus.model)} hazır`
                      : 'Derin model çevrimdışı'
                    : 'Derin model kontrol ediliyor'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black/20 text-zinc-400 transition hover:border-rose-300/50 hover:text-rose-100"
              aria-label="Asistanı kapat"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-[46vh] space-y-3 overflow-auto p-3">
            {messages.map((message, index) => (
              <div
                key={message.id || `${message.role}-${index}`}
                className={classNames(
                  'rounded-lg border p-3 text-sm leading-6',
                  message.role === 'assistant'
                    ? 'border-cyan-300/20 bg-cyan-300/10 text-zinc-100'
                    : 'ml-8 border-amber-300/20 bg-amber-300/10 text-amber-50',
                )}
              >
                {message.role === 'assistant' && message.source ? (
                  <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wide text-cyan-100/70">{message.source}</div>
                ) : null}
                {message.text.split('\n').map((line, lineIndex) => (
                  <p key={`${index}-${lineIndex}`} className="mb-2 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            ))}
            {isThinking ? (
              <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm font-semibold text-cyan-100">
                Astra derin yanıtı hazırlıyor...
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="mb-3 grid grid-cols-2 rounded-md border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                disabled={isThinking}
                onClick={() => setMode('fast')}
                className={classNames(
                  'min-h-9 rounded px-3 text-xs font-black transition disabled:opacity-50',
                  mode === 'fast' ? 'bg-emerald-400/15 text-emerald-100' : 'text-zinc-500 hover:text-zinc-200',
                )}
              >
                Hızlı Yanıt
              </button>
              <button
                type="button"
                disabled={isThinking || (modelStatus.checked && !modelStatus.available)}
                onClick={() => setMode('deep')}
                className={classNames(
                  'min-h-9 rounded px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40',
                  mode === 'deep' ? 'bg-cyan-300/15 text-cyan-100' : 'text-zinc-500 hover:text-zinc-200',
                )}
              >
                Derin / {formatAssistantModel(modelStatus.model)}
              </button>
            </div>
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {assistantQuickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isThinking}
                  onClick={() => submitMessage(prompt)}
                  className="shrink-0 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-cyan-200/50 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                submitMessage()
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isThinking}
                placeholder="Örn: adaptör ölçünce sağlam ama CACS çalışmıyor..."
                className="form-control min-h-11 min-w-0 flex-1 rounded-md px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              />
              <button
                type={isThinking ? 'button' : 'submit'}
                onClick={isThinking ? stopAssistantReply : undefined}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-cyan-200/40 bg-cyan-300/15 text-cyan-100 transition hover:bg-cyan-300/25"
                aria-label={isThinking ? 'Yanıtı durdur' : 'Mesaj gönder'}
              >
                {isThinking ? <Square className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Astra asistanını aç"
          className="group flex items-center rounded-xl border border-cyan-200/30 bg-[#101521]/90 p-1.5 text-left shadow-2xl shadow-black/40 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-100/70 sm:gap-3 sm:rounded-2xl sm:p-2.5 sm:pr-4"
        >
          <AssistantAvatar />
          <span className="hidden sm:block">
            <span className="block text-sm font-black text-white">Astra'ya Sor</span>
            <span className="block text-xs text-zinc-500 group-hover:text-cyan-100">Teknik destek robotu</span>
          </span>
          <MessageCircle className="hidden h-5 w-5 text-cyan-100 sm:block" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

function WorkbenchShell({ selectedProfile, serviceInfo, currentNode, history, candidates, resultNode, notes, setNotes, onBack, onReset, children }) {
  const [mobileTab, setMobileTab] = useState('diagnostic')

  useEffect(() => {
    setMobileTab('diagnostic')
  }, [currentNode.id])

  return (
    <main className="app-bg min-h-screen text-zinc-100">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="relative">
        <Header selectedProfile={selectedProfile} currentNode={currentNode} onBack={onBack} onReset={onReset} />

        <div className="mx-auto max-w-[1500px] px-4 pb-36 pt-4 sm:px-6">
          <div className="glass-panel mb-4 grid grid-cols-3 rounded-lg p-1 lg:hidden">
            {[
              ['diagnostic', 'Teşhis'],
              ['history', 'Geçmiş'],
              ['score', 'Kanıt'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMobileTab(id)}
                className={classNames(
                  'min-h-10 rounded-md text-sm font-bold transition',
                  mobileTab === id ? 'bg-white/10 text-rose-100' : 'text-zinc-500',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[290px_minmax(0,1fr)_350px]">
            <div className={classNames('lg:block', mobileTab === 'history' ? 'block' : 'hidden')}>
              <Sidebar selectedProfile={selectedProfile} serviceInfo={serviceInfo} history={history} />
            </div>
            <div className={classNames('min-w-0 lg:block', mobileTab === 'diagnostic' ? 'block' : 'hidden')}>{children}</div>
            <div className={classNames('lg:block', mobileTab === 'score' ? 'block' : 'hidden')}>
              <ScorePanel selectedProfile={selectedProfile} candidates={candidates} resultNode={resultNode} notes={notes} setNotes={setNotes} />
            </div>
          </div>
        </div>
        <AssistantWidget selectedProfile={selectedProfile} currentNode={currentNode} history={history} candidates={candidates} />
      </div>
    </main>
  )
}

function EvidencePanel({ node }) {
  const evidence = evidenceLabels[node.evidence?.level] || evidenceLabels.heuristic
  const sources = (node.sourceIds || []).map((sourceId) => diagnostics.sourceCatalog[sourceId]).filter(Boolean)
  const thresholdLabel = node.thresholdPolicy === 'model_specific'
    ? 'MODELİNE GÖRE DEĞİŞİR'
    : node.thresholdPolicy === 'general_screening'
      ? 'GENEL KONTROL'
      : null

  return (
    <section className="rounded-md border border-white/10 bg-white/[0.035] p-3" aria-label="Kaynak ve kontrol notu">
      <div className="flex flex-wrap items-center gap-2">
        <BookOpenCheck className="h-4 w-4 text-cyan-200" aria-hidden="true" />
        <span className="text-xs font-black uppercase tracking-wide text-zinc-400">Kaynak ve not</span>
        <Badge tone={evidence.tone}>{evidence.label}</Badge>
        {thresholdLabel ? <Badge tone={node.thresholdPolicy === 'model_specific' ? 'red' : 'zinc'}>{thresholdLabel}</Badge> : null}
        <span className="font-mono text-[11px] text-zinc-600">{node.evidence?.reviewedAt}</span>
      </div>

      <p className="mt-2 text-xs leading-5 text-zinc-500">{node.evidence?.statement}</p>

      {sources.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/10"
              title={source.scope}
            >
              {source.publisher}: {source.title}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          ))}
        </div>
      ) : (
        <div className="mt-2 text-xs font-semibold text-amber-100">Bu kontrol genel servis tecrübesine dayanır. Önce kablo, soket, oksit ve besleme kontrolü yapın.</div>
      )}
    </section>
  )
}

function ProcedureHeader({ node }) {
  const danger = node.danger ? dangerStyles[node.danger] : 'border-zinc-700 bg-zinc-900 text-zinc-300'
  const categoryLabel = node.category || nodeTypeLabels[node.type] || 'Teşhis'
  const typeLabel = nodeTypeLabels[node.type] || 'Teşhis Adımı'

  return (
    <div className="mb-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="amber">{categoryLabel}</Badge>
          {categoryLabel !== typeLabel ? <Badge>{typeLabel}</Badge> : null}
          {node.toolLevel === 'field_basic' ? <Badge tone="cyan">MULTİMETRE / PC / KABLO</Badge> : null}
        </div>
        {node.danger ? (
          <span className={classNames('inline-flex items-center gap-2 rounded border px-3 py-1 font-mono text-xs font-bold', danger)}>
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            Risk: {dangerLabels[node.danger] || node.danger}
          </span>
        ) : null}
      </div>
      <div>
        <h1 className="text-3xl font-black text-white">{node.title}</h1>
        <p className="mt-3 text-lg leading-8 text-zinc-300">{node.prompt}</p>
      </div>
      <EvidencePanel node={node} />
    </div>
  )
}

function ProbeGuide({ node }) {
  const items = [
    ['Ölçüm Cihazı', meterModeLabels[node.meterMode] || node.meterMode, Gauge],
    ['Kart Durumu', node.powerState, Power],
    ['Siyah Prob', node.probeBlack, KeyRound],
    ['Kırmızı Prob', node.probeRed, Zap],
  ].filter(([, value]) => value)

  const meterSymbol = /oscilloscope|analyzer/i.test(node.meterMode || '')
    ? 'ΔV'
    : /ohm|resistance|continuity/i.test(node.meterMode || '')
      ? 'Ω'
      : /diode/i.test(node.meterMode || '')
        ? '◁|'
        : /ac/i.test(node.meterMode || '') && !/dc/i.test(node.meterMode || '')
          ? 'V∿'
          : 'V⎓'
  const isDeenergized = /enerjisiz|enerji kesilmiş|kondansatörler boşaltılmış/i.test(node.powerState || '')
  const expected = node.expected
    ? `${node.expected.min} – ${node.expected.max} ${node.unit || ''}`.trim()
    : node.unit
      ? `Sonucu ${node.unit} olarak kaydedin`
      : 'Kararlı değeri kaydedin'

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {items.map(([label, value, Icon]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
              <Icon className="h-4 w-4 text-rose-200" aria-hidden="true" />
              {label}
            </div>
            <div className="text-sm font-semibold leading-6 text-zinc-200">{value}</div>
          </div>
        ))}
      </div>

      <section
        className="overflow-hidden rounded-lg border border-cyan-200/20 bg-[#080d16]"
        aria-label="Prob yerleşim rehberi"
        data-testid="probe-placement-guide"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Canlı Prob Yerleşimi</div>
            <div className="mt-1 text-xs text-zinc-500">Probları bağlamadan önce cihaz modunu ve enerji durumunu doğrulayın.</div>
          </div>
          <Badge tone={isDeenergized ? 'emerald' : 'amber'}>{isDeenergized ? 'ENERJİ KESİK' : 'ENERJİLİ ÖLÇÜM'}</Badge>
        </div>

        <div className="grid items-stretch gap-3 p-4 md:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-md border border-zinc-600/50 bg-black/30 p-4">
            <div className="absolute inset-y-0 left-0 w-1 bg-zinc-300" aria-hidden="true" />
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">COM · SİYAH PROB</div>
            <div className="mt-3 text-base font-black leading-6 text-white">{node.probeBlack || 'Ortak referans / GND'}</div>
            <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-zinc-100 via-zinc-500 to-transparent" aria-hidden="true" />
          </div>

          <div className="flex flex-col items-center justify-center rounded-md border border-cyan-200/20 bg-cyan-300/5 p-3 text-center">
            <div className="flex h-16 w-20 items-center justify-center rounded-lg border-2 border-cyan-200/30 bg-black/50 font-mono text-3xl font-black text-cyan-100 shadow-inner shadow-cyan-300/10">
              {meterSymbol}
            </div>
            <div className="mt-2 font-mono text-[10px] font-black uppercase tracking-wide text-zinc-500">{meterModeLabels[node.meterMode] || node.meterMode || 'Ölçüm modu'}</div>
            <div className="mt-2 rounded border border-amber-300/20 bg-amber-300/10 px-2 py-1 font-mono text-[10px] font-bold text-amber-100">{expected}</div>
          </div>

          <div className="relative overflow-hidden rounded-md border border-rose-300/30 bg-rose-500/5 p-4">
            <div className="absolute inset-y-0 right-0 w-1 bg-rose-400" aria-hidden="true" />
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-rose-200">V/Ω · KIRMIZI PROB</div>
            <div className="mt-3 text-base font-black leading-6 text-white">{node.probeRed || 'Ölçülecek test noktası'}</div>
            <div className="mt-3 h-1 rounded-full bg-gradient-to-l from-rose-400 via-rose-600 to-transparent" aria-hidden="true" />
          </div>
        </div>

        <div className={classNames(
          'border-t px-4 py-3 text-xs font-semibold leading-5',
          isDeenergized
            ? 'border-emerald-300/15 bg-emerald-400/5 text-emerald-100/80'
            : 'border-amber-300/20 bg-amber-400/10 text-amber-100',
        )}>
          {isDeenergized
            ? 'Enerji vermeden önce kondansatörlerin boşaldığını doğrulayın; süreklilik ve direnç ölçümünü enerjili devrede yapmayın.'
            : 'Enerjili ölçüm: probların kaymasını önleyin, tek elle çalışın ve önce siyah referansı sabitleyin. Şebeke tarafında yalnız uygun ölçüm kategorili ekipman kullanın.'}
        </div>
      </section>
    </div>
  )
}

function TestMethodPanel({ node }) {
  const steps = node.testSteps || []
  const stopConditions = node.stopConditions || []

  if (steps.length === 0 && stopConditions.length === 0) {
    return null
  }

  return (
    <div className="mt-5 border-y border-white/10 py-4">
      {steps.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-zinc-500">
            <ClipboardList className="h-4 w-4 text-cyan-200" aria-hidden="true" />
            Test Prosedürü
          </div>
          <ol className="grid gap-2 text-sm leading-6 text-zinc-300 md:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="font-mono font-black text-cyan-200">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {stopConditions.length > 0 ? (
        <div className={classNames('flex gap-3 text-sm leading-6 text-amber-100', steps.length > 0 && 'mt-4 border-t border-amber-300/15 pt-4')}>
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <div className="font-black">Testi durdurun</div>
            <div className="text-amber-100/75">{stopConditions.join(' • ')}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MeasurementNode({ node, onSubmit }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const hasMeasurementImage = node.imageUrl && node.imageUrl !== '/measurement-placeholder.svg'

  function handleSubmit(event) {
    event.preventDefault()
    const numericValue = Number(value)

    if (value === '' || Number.isNaN(numericValue)) {
      setError('Geçerli bir ölçüm değeri girin.')
      return
    }

    setError('')
    onSubmit(numericValue)
  }

  return (
    <section className="glass-panel rounded-lg p-5">
      <ProcedureHeader node={node} />
      <ProbeGuide node={node} />
      <TestMethodPanel node={node} />

      <div className={classNames('mt-5 grid gap-5', hasMeasurementImage && 'xl:grid-cols-[1fr_320px]')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-300">Ölçülen Değer</span>
            <div className="flex overflow-hidden rounded-lg border border-white/10 bg-black/20 focus-within:border-rose-300">
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="0.00"
                className="min-h-24 w-full bg-transparent px-5 font-mono text-4xl font-black text-white outline-none placeholder:text-zinc-700"
              />
              <span className="flex min-w-24 items-center justify-center border-l border-white/10 bg-white/5 px-5 font-mono text-3xl font-black text-rose-100">
                {node.unit}
              </span>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="emerald">
              Beklenen: {node.expected.min} - {node.expected.max} {node.unit}
            </Badge>
            {node.hint ? <span className="text-sm leading-6 text-zinc-500">{node.hint}</span> : null}
          </div>

          {error ? <div className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

          <IconButton type="submit" icon={ChevronRight} className="w-full border-rose-300/50 bg-gradient-to-r from-rose-500/25 via-amber-400/20 to-cyan-400/20 text-white hover:border-rose-200/70">
            Ölçümü Yorumla ve Devam Et
          </IconButton>
        </form>

        {hasMeasurementImage ? (
          <figure className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <img src={node.imageUrl} alt="Test noktası görseli" className="h-full min-h-72 w-full object-cover" />
          </figure>
        ) : null}
      </div>
    </section>
  )
}

function ChoiceNode({ node, onAnswer }) {
  const hasMeasurementImage = node.imageUrl && node.imageUrl !== '/measurement-placeholder.svg'

  return (
    <section className="glass-panel rounded-lg p-5">
      <ProcedureHeader node={node} />
      {node.meterMode || node.powerState ? <ProbeGuide node={node} /> : null}
      <TestMethodPanel node={node} />

      {hasMeasurementImage ? (
        <figure className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <img src={node.imageUrl} alt="Kontrol noktası görseli" className="h-64 w-full object-cover" />
        </figure>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <IconButton
          icon={CheckCircle2}
          onClick={() => onAnswer('yes')}
          className="min-h-16 border-emerald-300/50 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25"
        >
          {node.yesLabel || 'Evet'}
        </IconButton>
        <IconButton
          icon={XCircle}
          onClick={() => onAnswer('no')}
          className="min-h-16 border-red-300/50 bg-red-500/15 text-red-100 hover:bg-red-500/25"
        >
          {node.noLabel || 'Hayır'}
        </IconButton>
        <IconButton
          icon={AlertTriangle}
          onClick={() => onAnswer('unknown')}
          className="min-h-16 border-amber-300/50 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20"
        >
          {node.unknownLabel || 'Ölçemiyorum'}
        </IconButton>
      </div>
    </section>
  )
}

function SymptomNode({ node, onSelect }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <ProcedureHeader node={node} />

      <div className="grid gap-3 md:grid-cols-2">
        {node.options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onSelect(option)}
            className="group module-card rounded-lg p-4 pl-5 text-left transition hover:-translate-y-0.5 hover:border-rose-300/60"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <Badge tone="amber">{node.optionBadge || 'BELIRTI'}</Badge>
              <ChevronRight className="h-5 w-5 text-zinc-600 transition group-hover:text-rose-100" aria-hidden="true" />
            </div>
            <div className="text-lg font-black text-white">{option.label}</div>
            <div className="mt-2 text-sm leading-6 text-zinc-500">
              {option.description || 'Bu seçim arıza skorlarına ilk kanıt olarak eklenir.'}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function ResultNode({ node, history, candidates, selectedProfile, onDownloadPdf, pdfLoading, onReset }) {
  const severityClass = severityStyles[node.severity] || severityStyles.info

  return (
    <section className="space-y-4">
      <div className={classNames('rounded-lg border p-5 shadow-2xl', severityClass)}>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge tone={node.severity === 'critical' ? 'red' : node.severity === 'warning' ? 'amber' : 'cyan'}>
              {getRiskLabel(node.severity).toUpperCase()}
            </Badge>
            <h1 className="mt-3 text-3xl font-black text-white">{node.title}</h1>
            <p className="mt-3 text-lg leading-8 text-zinc-200">{node.summary}</p>
          </div>
          <div className="rounded-md border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-center">
            <div className="font-mono text-3xl font-black text-amber-100">%{candidates[0]?.probability || 0}</div>
            <div className="text-xs text-zinc-500">en yüksek kanıt payı</div>
          </div>
        </div>

        <EvidencePanel node={node} />

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ReportBlock icon={Layers3} title="Kontrol Edilecekler" items={node.components} />
          <ReportBlock icon={Wrench} title="Onarım Önerisi" text={node.repair} />
          <ReportBlock icon={BookOpenCheck} title="Doğrulama" text={node.verification} />
        </div>
      </div>

      <div className="glass-panel rounded-lg p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-black text-white">
          <ClipboardList className="h-4 w-4 text-rose-200" aria-hidden="true" />
          Rapor Özeti
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoCard label="Cihaz" value={selectedProfile?.name} />
          <InfoCard label="Test Sayısı" value={`${history.length} kayıt`} />
          <InfoCard label="En Güçlü Aday" value={candidates[0]?.label || '-'} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <IconButton
            icon={Download}
            onClick={onDownloadPdf}
            disabled={pdfLoading}
            className="border-amber-300/50 bg-gradient-to-r from-amber-400/20 to-rose-400/20 text-amber-50 hover:bg-amber-400/25"
          >
            {pdfLoading ? 'PDF Hazırlanıyor...' : 'Profesyonel PDF Raporu İndir'}
          </IconButton>
          <IconButton
            icon={RotateCcw}
            onClick={onReset}
            className="border-white/10 bg-white/5 text-zinc-100 hover:border-rose-300/60 hover:text-rose-100"
          >
            Yeni Teşhis Başlat
          </IconButton>
        </div>
      </div>
    </section>
  )
}

function ReportBlock({ icon: Icon, title, text, items }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <Icon className="h-4 w-4 text-rose-200" aria-hidden="true" />
        {title}
      </div>
      {items ? (
        <ul className="space-y-2 text-sm leading-6 text-zinc-300">
          {items.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-zinc-300">{text}</p>
      )}
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-600">{label}</div>
      <div className="text-sm font-semibold leading-6 text-zinc-200">{value || '-'}</div>
    </div>
  )
}

export default function DiagnosticEngine() {
  const [initialDraft] = useState(loadDiagnosticDraft)
  const initialProfileId = diagnostics.deviceProfiles.some((profile) => profile.id === initialDraft?.selectedProfileId)
    ? initialDraft.selectedProfileId
    : 'ups'
  const initialHistory = Array.isArray(initialDraft?.history) ? initialDraft.history : []
  const [serviceInfo, setServiceInfo] = useState(() => ({ ...emptyServiceInfo, ...(initialDraft?.serviceInfo || {}) }))
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfileId)
  const [currentNodeId, setCurrentNodeId] = useState(initialDraft?.currentNodeId || null)
  const [history, setHistory] = useState(initialHistory)
  const [scores, setScores] = useState(() => rebuildScores(initialProfileId, initialHistory))
  const [notes, setNotes] = useState(initialDraft?.notes || '')
  const [pdfLoading, setPdfLoading] = useState(false)
  const currentNodeIdRef = useRef(currentNodeId)
  const handleBackRef = useRef(null)

  currentNodeIdRef.current = currentNodeId

  const selectedProfile = diagnostics.deviceProfiles.find((profile) => profile.id === selectedProfileId)
  const currentNode = currentNodeId ? getNode(currentNodeId) : null
  const resultNode = currentNode?.type === 'result' ? currentNode : null
  const profileFaultIds = useMemo(() => getProfileFaultIds(selectedProfileId), [selectedProfileId])

  const candidates = useMemo(
    () => getFaultCandidates(scores, diagnostics.faultCatalog, 6, profileFaultIds),
    [scores, profileFaultIds],
  )

  function pushStep({ toId, node, answer, interpretation, scoreDelta }) {
    const entry = {
      fromId: node.id,
      toId,
      title: node.title,
      category: node.category || node.type,
      answer,
      interpretation,
      scoreDelta,
      time: formatTime(),
      timestamp: new Date().toISOString(),
    }

    setHistory((previous) => [...previous, entry])
    setScores((previous) => applyScoreDelta(previous, scoreDelta))
    setCurrentNodeId(toId)
  }

  function handleStart(profile = selectedProfile) {
    setSelectedProfileId(profile.id)
    setServiceInfo((previous) => ({
      ...previous,
      symptom: profile.commonSymptoms?.[0] || '',
    }))
    setCurrentNodeId(profile.startNodeId)
    setHistory([])
    setScores(getInitialScores(profile.id))
    setNotes('')
  }

  function handleSymptomSelect(option) {
    setServiceInfo((previous) => ({ ...previous, symptom: option.label }))

    pushStep({
      toId: option.next,
      node: currentNode,
      answer: option.label,
      interpretation: 'Belirti sınıflandırması arıza skorlarına işlendi.',
      scoreDelta: option.scoreDelta,
    })
  }

  function handleMeasurementSubmit(value) {
    const evaluation = evaluateMeasurement(currentNode, value)

    pushStep({
      toId: evaluation.nextNodeId,
      node: currentNode,
      answer: `${value} ${currentNode.unit}`,
      interpretation: evaluation.label,
      scoreDelta: evaluation.scoreDelta,
    })
  }

  function handleChoiceAnswer(answerKey) {
    const answerText = {
      yes: currentNode.yesLabel || 'Evet',
      no: currentNode.noLabel || 'Hayır',
      unknown: currentNode.unknownLabel || 'Ölçemiyorum',
    }[answerKey]

    const nextNodeId = {
      yes: currentNode.nextYes,
      no: currentNode.nextNo,
      unknown: currentNode.nextUnknown,
    }[answerKey]

    const scoreDelta = {
      yes: currentNode.scoreYes,
      no: currentNode.scoreNo,
      unknown: currentNode.scoreUnknown,
    }[answerKey]

    pushStep({
      toId: nextNodeId,
      node: currentNode,
      answer: answerText,
      interpretation: answerKey === 'unknown' ? 'Ölçüm yapılamadığı için düşük güvenli kanıt eklendi.' : 'Gözlem sonucu arıza skorlarına işlendi.',
      scoreDelta,
    })
  }

  function handleBack() {
    if (history.length === 0) {
      setCurrentNodeId(null)
      setScores(getInitialScores(selectedProfileId))
      return
    }

    const previousHistory = history.slice(0, -1)
    const lastEntry = history[history.length - 1]

    setCurrentNodeId(lastEntry.fromId)
    setHistory(previousHistory)

    setScores(rebuildScores(selectedProfileId, previousHistory))
  }

  function handleReset() {
    setServiceInfo(emptyServiceInfo)
    setSelectedProfileId('ups')
    setCurrentNodeId(null)
    setHistory([])
    setScores(getInitialScores('ups'))
    setNotes('')
    localStorage.removeItem(diagnosticDraftKey)
  }

  async function handleDownloadPdf() {
    setPdfLoading(true)

    try {
      const { downloadServiceReport } = await import('../utils/pdfReport')
      await downloadServiceReport({
        appName: diagnostics.appName,
        selectedProfile,
        history,
        candidates,
        resultNode,
        notes,
      })
    } finally {
      setPdfLoading(false)
    }
  }

  handleBackRef.current = handleBack

  useEffect(() => {
    if (!currentNodeId) {
      localStorage.removeItem(diagnosticDraftKey)
      return
    }

    try {
      localStorage.setItem(diagnosticDraftKey, JSON.stringify({
        version: diagnostics.version,
        serviceInfo,
        selectedProfileId,
        currentNodeId,
        history,
        notes,
        savedAt: new Date().toISOString(),
      }))
    } catch {
      // Storage can be unavailable in private browsing; diagnosis still works in memory.
    }
  }, [currentNodeId, history, notes, selectedProfileId, serviceInfo])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [currentNodeId])

  useEffect(() => {
    const sentinel = { terminalElektronikNavigation: true }

    if (!window.history.state?.terminalElektronikNavigation) {
      window.history.pushState(sentinel, '')
    }

    function handleBrowserBack() {
      if (!currentNodeIdRef.current) {
        return
      }

      handleBackRef.current?.()
      window.history.pushState(sentinel, '')
    }

    window.addEventListener('popstate', handleBrowserBack)
    return () => window.removeEventListener('popstate', handleBrowserBack)
  }, [])

  if (!currentNode) {
    return (
      <main className="app-bg min-h-screen text-zinc-100">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="relative">
          <ServiceIntake
            setServiceInfo={setServiceInfo}
            selectedProfileId={selectedProfileId}
            setSelectedProfileId={setSelectedProfileId}
            onStart={handleStart}
          />
          <AssistantWidget selectedProfile={selectedProfile} currentNode={currentNode} history={history} candidates={candidates} />
        </div>
      </main>
    )
  }

  return (
    <WorkbenchShell
      selectedProfile={selectedProfile}
      serviceInfo={serviceInfo}
      currentNode={currentNode}
      history={history}
      candidates={candidates}
      resultNode={resultNode}
      notes={notes}
      setNotes={setNotes}
      onBack={handleBack}
      onReset={handleReset}
    >
      {currentNode.type === 'symptom' ? <SymptomNode key={currentNode.id} node={currentNode} onSelect={handleSymptomSelect} /> : null}
      {currentNode.type === 'measurement' ? <MeasurementNode key={currentNode.id} node={currentNode} onSubmit={handleMeasurementSubmit} /> : null}
      {['question_boolean', 'inspection', 'component_test'].includes(currentNode.type) ? <ChoiceNode key={currentNode.id} node={currentNode} onAnswer={handleChoiceAnswer} /> : null}
      {currentNode.type === 'result' ? (
        <ResultNode
          key={currentNode.id}
          node={currentNode}
          history={history}
          candidates={candidates}
          selectedProfile={selectedProfile}
          onDownloadPdf={handleDownloadPdf}
          pdfLoading={pdfLoading}
          onReset={handleReset}
        />
      ) : null}
    </WorkbenchShell>
  )
}
