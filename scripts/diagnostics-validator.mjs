import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

function collectScoreIds(value, ids = new Set()) {
  if (!value || typeof value !== 'object') {
    return ids
  }

  for (const field of ['scoreDelta', 'scoreYes', 'scoreNo', 'scoreUnknown']) {
    Object.keys(value[field] || {}).forEach((id) => ids.add(id))
  }

  Object.values(value).forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((item) => collectScoreIds(item, ids))
    } else if (child && typeof child === 'object') {
      collectScoreIds(child, ids)
    }
  })

  return ids
}

function getNodeTargets(node) {
  if (node.type === 'symptom') {
    return (node.options || []).map((option) => option.next)
  }

  if (['question_boolean', 'inspection', 'component_test'].includes(node.type)) {
    return [node.nextYes, node.nextNo, node.nextUnknown]
  }

  if (node.type === 'measurement') {
    return [...(node.rules || []).map((rule) => rule.next), node.fallbackNext]
  }

  return []
}

export function validateDiagnostics(data) {
  const errors = []
  const nodes = data.nodes || {}
  const catalog = data.faultCatalog || {}
  const sources = data.sourceCatalog || {}
  const allowedEvidenceLevels = new Set(['manufacturer', 'standard', 'engineering', 'heuristic'])
  const allowedSourceTypes = new Set(['manufacturer', 'standards-body', 'engineering-guide'])
  const allowedThresholdPolicies = new Set(['model_specific', 'general_screening'])
  const profileIds = new Set((data.deviceProfiles || []).map((profile) => profile.id))
  const inboundCounts = Object.fromEntries(Object.keys(nodes).map((nodeId) => [nodeId, 0]))

  function validateSourceIds(owner, sourceIds, required = false) {
    if (required && (!Array.isArray(sourceIds) || sourceIds.length === 0)) {
      errors.push(`${owner}: at least one technical source is required`)
      return
    }

    for (const sourceId of sourceIds || []) {
      if (!sources[sourceId]) {
        errors.push(`${owner}: unknown technical source ${sourceId}`)
      }
    }
  }

  for (const [sourceId, source] of Object.entries(sources)) {
    if (!source.publisher || !source.title || !/^https:\/\//.test(source.url || '')) {
      errors.push(`${sourceId}: source requires publisher, title and an HTTPS URL`)
    }

    if (!allowedSourceTypes.has(source.sourceType) || !source.scope || !/^\d{4}-\d{2}-\d{2}$/.test(source.retrievedAt || '')) {
      errors.push(`${sourceId}: source requires a valid sourceType, scope and retrievedAt date`)
    }
  }

  if (Object.keys(sources).length < 8) {
    errors.push(`sourceCatalog: expected at least 8 primary technical sources`)
  }

  for (const [key, node] of Object.entries(nodes)) {
    if (node.id !== key) {
      errors.push(`${key}: node.id does not match its object key`)
    }

    if (!profileIds.has(node.device)) {
      errors.push(`${key}: unknown device profile ${node.device}`)
    }

    if (!node.title || !node.category || (node.type !== 'result' && !node.prompt)) {
      errors.push(`${key}: title, category and prompt are required for diagnostic steps`)
    }

    validateSourceIds(key, node.sourceIds)

    if (!allowedEvidenceLevels.has(node.evidence?.level) || !node.evidence?.statement || !/^\d{4}-\d{2}-\d{2}$/.test(node.evidence?.reviewedAt || '')) {
      errors.push(`${key}: evidence level, statement and reviewedAt date are required`)
    }

    for (const target of getNodeTargets(node)) {
      if (!target) {
        errors.push(`${key}: empty decision target`)
      } else if (!nodes[target]) {
        errors.push(`${key}: target node ${target} does not exist`)
      } else {
        inboundCounts[target] += 1

        if (target === key) {
          errors.push(`${key}: node cannot target itself`)
        }

        if (nodes[target].device !== node.device) {
          errors.push(`${key}: cross-profile target ${target}`)
        }
      }
    }

    if (node.type === 'symptom') {
      if (!Array.isArray(node.options) || node.options.length < 2) {
        errors.push(`${key}: symptom selection requires at least two options`)
      }

      for (const option of node.options || []) {
        if (!option.label || !option.next) {
          errors.push(`${key}: every symptom option requires label and next`)
        }
      }
    }

    if (['question_boolean', 'inspection', 'component_test'].includes(node.type)) {
      if (!node.yesLabel || !node.noLabel || !node.unknownLabel) {
        errors.push(`${key}: all three decision labels are required`)
      }
    }

    if (node.type === 'measurement') {
      if (!allowedThresholdPolicies.has(node.thresholdPolicy)) {
        errors.push(`${key}: measurement requires model_specific or general_screening thresholdPolicy`)
      }

      if (!node.expected || !Number.isFinite(node.expected.min) || !Number.isFinite(node.expected.max)) {
        errors.push(`${key}: invalid expected measurement range`)
      } else if (node.expected.min > node.expected.max) {
        errors.push(`${key}: expected.min is greater than expected.max`)
      }

      if (!Array.isArray(node.rules) || node.rules.length === 0) {
        errors.push(`${key}: measurement has no rules`)
      }

      for (const field of ['unit', 'meterMode', 'powerState', 'probeBlack', 'probeRed', 'fallbackNext']) {
        if (!node[field]) {
          errors.push(`${key}: measurement field ${field} is required`)
        }
      }

      for (const rule of node.rules || []) {
        if (!rule.when?.operator || !rule.label || !rule.next) {
          errors.push(`${key}: every measurement rule requires when, label and next`)
        }
      }
    }

    if (node.type === 'result') {
      if (!node.summary || !node.repair || !node.verification || !Array.isArray(node.components) || node.components.length === 0) {
        errors.push(`${key}: result requires summary, components, repair and verification`)
      }
    }
  }

  for (const [faultId, fault] of Object.entries(catalog)) {
    if (!fault.label || !fault.componentGroup || !['info', 'warning', 'critical'].includes(fault.risk)) {
      errors.push(`${faultId}: invalid fault catalog entry`)
    }
  }

  for (const profile of data.deviceProfiles || []) {
    if (!nodes[profile.startNodeId]) {
      errors.push(`${profile.id}: start node ${profile.startNodeId} does not exist`)
    }

    validateSourceIds(profile.id, profile.sourceIds, true)

    if (profile.priorModel?.type !== 'heuristic_service_priority' || profile.priorModel?.calibrated !== false) {
      errors.push(`${profile.id}: priorModel must explicitly identify uncalibrated heuristic service priorities`)
    }

    const priors = data.faultPriorScores?.[profile.id]
    if (!priors) {
      errors.push(`${profile.id}: faultPriorScores entry is missing`)
      continue
    }

    const total = Object.values(priors).reduce((sum, value) => sum + value, 0)
    if (total !== 100) {
      errors.push(`${profile.id}: initial fault scores total ${total}, expected 100`)
    }

    for (const faultId of Object.keys(priors)) {
      if (!catalog[faultId]) {
        errors.push(`${profile.id}: initial score references missing fault ${faultId}`)
      }
    }

    const displayPriors = profile.faultPriors || []
    const displayTotal = displayPriors.reduce((sum, item) => sum + item.probability, 0)
    if (displayTotal !== 100) {
      errors.push(`${profile.id}: displayed fault priors total ${displayTotal}, expected 100`)
    }

    const displayIds = new Set(displayPriors.map((item) => item.faultId))
    for (const item of displayPriors) {
      if (item.weightType !== 'heuristic_service_priority' || item.calibrated !== false || item.evidenceLevel !== 'low') {
        errors.push(`${profile.id}: displayed prior ${item.faultId} must be an uncalibrated low-evidence service weight`)
      }
      validateSourceIds(`${profile.id}.${item.faultId}`, item.sourceIds, true)
    }
    for (const [faultId, probability] of Object.entries(priors)) {
      const displayPrior = displayPriors.find((item) => item.faultId === faultId)
      if (!displayPrior) {
        errors.push(`${profile.id}: displayed priors missing ${faultId}`)
      } else if (displayPrior.probability !== probability || displayPrior.label !== catalog[faultId]?.label) {
        errors.push(`${profile.id}: displayed prior ${faultId} is out of sync with score/catalog data`)
      }
    }

    for (const faultId of displayIds) {
      if (!priors[faultId]) {
        errors.push(`${profile.id}: displayed prior ${faultId} is not in faultPriorScores`)
      }
    }

    const profileNodes = Object.values(nodes).filter((node) => node.device === profile.id)
    const decisionCount = profileNodes.filter((node) => node.type !== 'result').length
    const measurementCount = profileNodes.filter((node) => node.type === 'measurement').length
    const resultCount = profileNodes.filter((node) => node.type === 'result').length

    if (decisionCount < 6 || measurementCount < 2 || resultCount < 4) {
      errors.push(`${profile.id}: insufficient diagnostic depth (${decisionCount} decisions, ${measurementCount} measurements, ${resultCount} results)`)
    }

    const reachable = new Set()
    const queue = [profile.startNodeId]
    while (queue.length > 0) {
      const nodeId = queue.shift()
      if (!nodes[nodeId] || reachable.has(nodeId)) {
        continue
      }

      reachable.add(nodeId)
      queue.push(...getNodeTargets(nodes[nodeId]).filter(Boolean))
    }

    for (const node of profileNodes) {
      if (!reachable.has(node.id)) {
        errors.push(`${node.id}: node is unreachable from ${profile.id}`)
      }
    }

    const visited = new Set()
    const activePath = new Set()
    let cycleReported = false

    function visitForCycles(nodeId) {
      if (cycleReported || visited.has(nodeId) || !nodes[nodeId]) {
        return
      }

      if (activePath.has(nodeId)) {
        errors.push(`${profile.id}: diagnostic graph contains a cycle at ${nodeId}`)
        cycleReported = true
        return
      }

      activePath.add(nodeId)
      for (const target of getNodeTargets(nodes[nodeId]).filter(Boolean)) {
        visitForCycles(target)
      }
      activePath.delete(nodeId)
      visited.add(nodeId)
    }

    visitForCycles(profile.startNodeId)
  }

  for (const faultId of collectScoreIds(nodes)) {
    if (!catalog[faultId]) {
      errors.push(`decision tree references missing fault ${faultId}`)
    }
  }

  if (data.researchAudit?.priorCalibration !== 'uncalibrated_heuristic' || !/^\d{4}-\d{2}-\d{2}$/.test(data.researchAudit?.reviewedAt || '')) {
    errors.push('researchAudit: reviewedAt and uncalibrated_heuristic priorCalibration are required')
  }

  const measurements = Object.values(nodes).filter((node) => node.type === 'measurement')
  const expectedCoverage = {
    profileCount: profileIds.size,
    nodeCount: Object.keys(nodes).length,
    faultCount: Object.keys(catalog).length,
    sourceCount: Object.keys(sources).length,
    measurementCount: measurements.length,
    sourcedMeasurementCount: measurements.filter((node) => node.sourceIds?.length > 0).length,
    modelSpecificMeasurementCount: measurements.filter((node) => node.thresholdPolicy === 'model_specific').length,
    heuristicNodeCount: Object.values(nodes).filter((node) => node.evidence?.level === 'heuristic').length,
  }
  for (const [field, expectedValue] of Object.entries(expectedCoverage)) {
    if (data.researchAudit?.coverage?.[field] !== expectedValue) {
      errors.push(`researchAudit.coverage.${field}: expected ${expectedValue}`)
    }
  }

  if (!/gerçek arıza olasılığı|saha istatistiği/i.test(data.probabilityDisclaimer || '')) {
    errors.push('probabilityDisclaimer: must state that service weights are not field failure probabilities')
  }

  for (const nodeId of Object.keys(nodes)) {
    const isStartNode = data.deviceProfiles?.some((profile) => profile.startNodeId === nodeId)
    if (!isStartNode && inboundCounts[nodeId] === 0) {
      errors.push(`${nodeId}: node has no inbound decision path`)
    }
  }

  return errors
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const data = JSON.parse(readFileSync(new URL('../src/data/diagnostics.json', import.meta.url), 'utf8'))
  const errors = validateDiagnostics(data)

  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exitCode = 1
  } else {
    const measurementNodes = Object.values(data.nodes).filter((node) => node.type === 'measurement')
    const sourcedMeasurements = measurementNodes.filter((node) => node.sourceIds?.length > 0).length
    console.log(`Diagnostics valid: ${Object.keys(data.nodes).length} nodes, ${Object.keys(data.faultCatalog).length} faults, ${Object.keys(data.sourceCatalog).length} sources, ${sourcedMeasurements}/${measurementNodes.length} sourced measurements.`)
  }
}
