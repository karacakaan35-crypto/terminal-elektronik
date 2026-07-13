export function matchesRule(value, rule) {
  const condition = rule.when

  if (!condition) {
    return false
  }

  switch (condition.operator) {
    case '<':
      return value < condition.value
    case '<=':
      return value <= condition.value
    case '>':
      return value > condition.value
    case '>=':
      return value >= condition.value
    case 'between':
      return value >= condition.min && value <= condition.max
    case 'outside':
      return value < condition.min || value > condition.max
    default:
      return false
  }
}

function getRuleDirection(rule, expected) {
  const condition = rule.when

  if (!condition || !expected) {
    return []
  }

  if (condition.operator === '<' || condition.operator === '<=') {
    return condition.value <= expected.min ? ['low'] : []
  }

  if (condition.operator === '>' || condition.operator === '>=') {
    return condition.value >= expected.max ? ['high'] : []
  }

  if (condition.operator === 'between') {
    if (condition.max < expected.min) {
      return ['low']
    }

    if (condition.min > expected.max) {
      return ['high']
    }
  }

  if (condition.operator === 'outside') {
    return ['low', 'high']
  }

  return []
}

function getDirectionalRule(node, direction) {
  const expected = node.expected
  const candidates = (node.rules || []).filter((rule) => getRuleDirection(rule, expected).includes(direction))

  if (candidates.length > 0) {
    return candidates[direction === 'low' ? candidates.length - 1 : 0]
  }

  return (node.rules || []).find((rule) => getRuleDirection(rule, expected).length > 0)
}

export function evaluateMeasurement(node, value) {
  const matchedRule = node.rules?.find((rule) => matchesRule(value, rule))
  const expected = node.expected
  const passed = expected ? value >= expected.min && value <= expected.max : false
  const direction = expected && !passed ? (value < expected.min ? 'low' : 'high') : null
  const inferredRule = !matchedRule && direction ? getDirectionalRule(node, direction) : null
  const selectedRule = matchedRule || inferredRule
  const directionLabel = direction === 'low' ? 'Beklenen aralığın altında' : 'Beklenen aralığın üzerinde'

  return {
    matchedRule: selectedRule,
    inferred: Boolean(inferredRule),
    passed,
    nextNodeId: selectedRule?.next || node.fallbackNext,
    scoreDelta: selectedRule?.scoreDelta || {},
    label: matchedRule?.label || (inferredRule ? `${directionLabel}: ${inferredRule.label}` : passed ? 'Beklenen aralıkta' : 'Beklenen aralık dışında'),
  }
}
