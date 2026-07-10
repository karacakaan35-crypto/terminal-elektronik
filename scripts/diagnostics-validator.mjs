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
  const profileIds = new Set((data.deviceProfiles || []).map((profile) => profile.id))

  for (const [key, node] of Object.entries(nodes)) {
    if (node.id !== key) {
      errors.push(`${key}: node.id does not match its object key`)
    }

    if (!profileIds.has(node.device)) {
      errors.push(`${key}: unknown device profile ${node.device}`)
    }

    for (const target of getNodeTargets(node)) {
      if (!target) {
        errors.push(`${key}: empty decision target`)
      } else if (!nodes[target]) {
        errors.push(`${key}: target node ${target} does not exist`)
      }
    }

    if (node.type === 'measurement') {
      if (!node.expected || !Number.isFinite(node.expected.min) || !Number.isFinite(node.expected.max)) {
        errors.push(`${key}: invalid expected measurement range`)
      } else if (node.expected.min > node.expected.max) {
        errors.push(`${key}: expected.min is greater than expected.max`)
      }

      if (!Array.isArray(node.rules) || node.rules.length === 0) {
        errors.push(`${key}: measurement has no rules`)
      }
    }
  }

  for (const profile of data.deviceProfiles || []) {
    if (!nodes[profile.startNodeId]) {
      errors.push(`${profile.id}: start node ${profile.startNodeId} does not exist`)
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
  }

  for (const faultId of collectScoreIds(nodes)) {
    if (!catalog[faultId]) {
      errors.push(`decision tree references missing fault ${faultId}`)
    }
  }

  const reachable = new Set()
  const queue = (data.deviceProfiles || []).map((profile) => profile.startNodeId)
  while (queue.length > 0) {
    const nodeId = queue.shift()
    if (!nodes[nodeId] || reachable.has(nodeId)) {
      continue
    }

    reachable.add(nodeId)
    queue.push(...getNodeTargets(nodes[nodeId]).filter(Boolean))
  }

  for (const nodeId of Object.keys(nodes)) {
    if (!reachable.has(nodeId)) {
      errors.push(`${nodeId}: node is unreachable from every device profile`)
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
    console.log(`Diagnostics valid: ${Object.keys(data.nodes).length} nodes, ${Object.keys(data.faultCatalog).length} faults.`)
  }
}
