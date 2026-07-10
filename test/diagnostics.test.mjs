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

test('PBX borderline low voltage follows the abnormal line-voltage branch', () => {
  const result = evaluateMeasurement(diagnostics.nodes.pbx_extension_voltage, 20)

  assert.equal(result.passed, false)
  assert.equal(result.inferred, true)
  assert.equal(result.nextNodeId, 'pbx_result_line_voltage')
  assert.match(result.label, /altında/)
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
