export function applyScoreDelta(scores, scoreDelta = {}) {
  const nextScores = { ...scores }

  Object.entries(scoreDelta).forEach(([faultId, delta]) => {
    nextScores[faultId] = Math.max(0, (nextScores[faultId] || 0) + delta)
  })

  return nextScores
}

export function createInitialScores(profileId, priorScoreMap = {}) {
  return { ...(priorScoreMap[profileId] || {}) }
}

export function getFaultCandidates(scores, catalog, limit = 6, allowedFaultIds = []) {
  const allowed = new Set(allowedFaultIds)
  const entries = Object.entries(catalog)
    .filter(([id]) => allowed.size === 0 || allowed.has(id))
    .map(([id, fault]) => ({
      id,
      ...fault,
      score: scores[id] || 0,
    }))

  const totalScore = entries.reduce((total, entry) => total + Math.max(0, entry.score), 0)
  const normalized = entries.map((entry) => {
    const exactProbability = totalScore > 0 ? (Math.max(0, entry.score) / totalScore) * 100 : 0

    return {
      ...entry,
      probability: Math.floor(exactProbability),
      probabilityRemainder: exactProbability - Math.floor(exactProbability),
    }
  })

  let remainingPoints = 100 - normalized.reduce((total, entry) => total + entry.probability, 0)
  const remainderOrder = [...normalized].sort(
    (a, b) => b.probabilityRemainder - a.probabilityRemainder || b.score - a.score,
  )

  for (let index = 0; index < remainderOrder.length && remainingPoints > 0; index += 1) {
    remainderOrder[index].probability += 1
    remainingPoints -= 1
  }

  return normalized
    .map(({ probabilityRemainder: _probabilityRemainder, ...entry }) => entry)
    .filter((entry) => entry.probability > 0)
    .sort((a, b) => b.probability - a.probability || b.score - a.score)
    .slice(0, limit)
}

export function getRiskLabel(severity) {
  if (severity === 'critical') {
    return 'Kritik'
  }

  if (severity === 'warning') {
    return 'Uyarı'
  }

  return 'Bilgi'
}
