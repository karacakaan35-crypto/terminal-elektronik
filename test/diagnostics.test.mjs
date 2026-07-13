import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { validateDiagnostics } from '../scripts/diagnostics-validator.mjs'
import { evaluateMeasurement, matchesRule } from '../src/utils/ruleEvaluator.js'
import { createInitialScores, getFaultCandidates } from '../src/utils/scoringEngine.js'

const diagnostics = JSON.parse(readFileSync(new URL('../src/data/diagnostics.json', import.meta.url), 'utf8'))

test('diagnostic graph and score references are valid', () => {
  assert.deepEqual(validateDiagnostics(diagnostics), [])
})

test('PBX borderline low voltage follows the explicit abnormal line-voltage branch', () => {
  const result = evaluateMeasurement(diagnostics.nodes.pbx_extension_voltage, 20)

  assert.equal(result.passed, false)
  assert.equal(result.inferred, false)
  assert.equal(result.nextNodeId, 'pbx_result_line_voltage')
  assert.match(result.label, /düşük\/sınırda/)
})

test('PBX 24V idle reading remains valid for supported FXS hardware families', () => {
  const result = evaluateMeasurement(diagnostics.nodes.pbx_extension_voltage, 24)

  assert.equal(result.passed, true)
  assert.equal(result.nextNodeId, 'pbx_offhook_response')
})

test('fire-panel EOL values are evaluated against the selected model reference', () => {
  const mismatch = evaluateMeasurement(diagnostics.nodes.fire_zone_resistance_22k, 3000)
  const nominal = evaluateMeasurement(diagnostics.nodes.fire_zone_resistance, 6800)

  assert.equal(mismatch.passed, false)
  assert.equal(mismatch.nextNodeId, 'fire_result_eol_mismatch')
  assert.equal(nominal.passed, true)
  assert.equal(nominal.nextNodeId, 'fire_zone_alarm_led')
})

test('Nice barrier flash codes route to the documented subsystem checks', () => {
  const options = Object.fromEntries(diagnostics.nodes.barrier_flash_code.options.map((option) => [option.label, option.next]))

  assert.equal(options['1 flaş: BlueBUS sistem hatası'], 'barrier_result_bluebus')
  assert.equal(options['2 flaş: Fotosel aktif'], 'barrier_photo_alignment')
  assert.equal(options['3 flaş: Motor kuvvet limiti'], 'barrier_mechanical_balance')
  assert.equal(options['4 flaş: STOP girişi aktif'], 'barrier_stop_input')
})

test('professional dataset keeps broad profile, node, fault and source coverage', () => {
  assert.equal(diagnostics.deviceProfiles.length, 10)
  assert.ok(Object.keys(diagnostics.nodes).length >= 275)
  assert.ok(Object.keys(diagnostics.faultCatalog).length >= 80)
  assert.ok(Object.keys(diagnostics.sourceCatalog).length >= 12)
})

test('every out-of-range measurement resolves to an explicit or inferred abnormal rule', () => {
  const measurements = Object.values(diagnostics.nodes).filter((node) => node.type === 'measurement')

  for (const node of measurements) {
    const span = Math.max(Math.abs(node.expected.max - node.expected.min), 1)
    const values = [node.expected.min - span * 0.1, node.expected.max + span * 0.1]

    for (const value of values) {
      const hasDirectRule = node.rules.some((rule) => matchesRule(value, rule))
      const result = evaluateMeasurement(node, value)

      assert.equal(result.passed, false, `${node.id}: ${value} should be out of range`)
      assert.ok(result.nextNodeId, `${node.id}: ${value} has no next node`)
      assert.ok(hasDirectRule || result.inferred, `${node.id}: ${value} silently used fallbackNext`)
    }
  }
})

test('live candidate probabilities are normalized to 100 percent', () => {
  for (const profile of diagnostics.deviceProfiles) {
    const scores = createInitialScores(profile.id, diagnostics.faultPriorScores)
    const allowedFaultIds = Object.keys(scores)
    const candidates = getFaultCandidates(scores, diagnostics.faultCatalog, 100, allowedFaultIds)

    assert.equal(candidates.reduce((sum, candidate) => sum + candidate.probability, 0), 100, profile.id)
  }
})

test('PBX port fault is present in the live candidate list', () => {
  const scores = createInitialScores('pbx', diagnostics.faultPriorScores)
  const candidates = getFaultCandidates(scores, diagnostics.faultCatalog, 100, Object.keys(scores))

  assert.ok(candidates.some((candidate) => candidate.id === 'pbx_port_fault'))
})
