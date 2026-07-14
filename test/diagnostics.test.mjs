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
  assert.ok(Object.keys(diagnostics.sourceCatalog).length >= 20)
})

test('service weights are explicitly uncalibrated and never represented as field failure rates', () => {
  assert.equal(diagnostics.researchAudit.priorCalibration, 'uncalibrated_heuristic')
  assert.match(diagnostics.probabilityDisclaimer, /gerçek arıza olasılığı|saha istatistiği/i)

  for (const profile of diagnostics.deviceProfiles) {
    assert.equal(profile.priorModel.type, 'heuristic_service_priority')
    assert.equal(profile.priorModel.calibrated, false)
    assert.ok(profile.faultPriors.every((prior) => prior.calibrated === false))
  }
})

test('every diagnostic step exposes reviewed evidence and every measurement declares threshold scope', () => {
  const allowedEvidenceLevels = new Set(['manufacturer', 'standard', 'engineering', 'heuristic'])
  const allowedThresholdPolicies = new Set(['model_specific', 'general_screening'])

  for (const node of Object.values(diagnostics.nodes)) {
    assert.ok(allowedEvidenceLevels.has(node.evidence.level), node.id)
    assert.match(node.evidence.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, node.id)

    if (node.type === 'measurement') {
      assert.ok(allowedThresholdPolicies.has(node.thresholdPolicy), node.id)
    }
  }
})

test('high-risk model-dependent measurements keep manufacturer references', () => {
  assert.equal(diagnostics.nodes.fire_zone_resistance.thresholdPolicy, 'model_specific')
  assert.deepEqual(diagnostics.nodes.fire_zone_resistance.sourceIds, ['ctec_fire'])
  assert.deepEqual(diagnostics.nodes.fire_zone_resistance_47k.sourceIds, ['notifier_nfs_supra'])
  assert.equal(diagnostics.nodes.pbx_extension_voltage.thresholdPolicy, 'model_specific')
  assert.deepEqual(diagnostics.nodes.ups_charge_voltage.sourceIds, ['yuasa_vrla'])
})

test('fire panel battery branch separates float charging from an undercharged 24V group', () => {
  const nominalFloat = evaluateMeasurement(diagnostics.nodes.fire_battery_voltage, 27.3)
  const undercharged = evaluateMeasurement(diagnostics.nodes.fire_battery_voltage, 24)

  assert.equal(nominalFloat.nextNodeId, 'fire_panel_24v')
  assert.equal(nominalFloat.passed, true)
  assert.equal(undercharged.nextNodeId, 'fire_result_battery')
  assert.equal(undercharged.passed, false)
})

test('OSDP electrical screening requires differential activity and does not claim protocol validity', () => {
  const inactive = evaluateMeasurement(diagnostics.nodes.access_bus_voltage, 0.1)
  const active = evaluateMeasurement(diagnostics.nodes.access_bus_voltage, 1.5)

  assert.equal(inactive.nextNodeId, 'access_result_rs485_bus')
  assert.equal(active.nextNodeId, 'access_result_config')
  assert.match(active.label, /çerçevesini analiz edin/i)
  assert.match(diagnostics.nodes.access_bus_voltage.hint, /kanıtlamaz/i)
})

test('research audit coverage matches the generated dataset', () => {
  const measurements = Object.values(diagnostics.nodes).filter((node) => node.type === 'measurement')
  const coverage = diagnostics.researchAudit.coverage

  assert.equal(coverage.nodeCount, Object.keys(diagnostics.nodes).length)
  assert.equal(coverage.sourceCount, Object.keys(diagnostics.sourceCatalog).length)
  assert.equal(coverage.measurementCount, measurements.length)
  assert.equal(coverage.sourcedMeasurementCount, measurements.filter((node) => node.sourceIds.length > 0).length)
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

test('live candidate evidence shares are normalized to 100 percent', () => {
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
