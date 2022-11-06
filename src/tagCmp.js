export function tagCmp (value, converted) {
  if (Array.isArray(converted)) {
    switch (converted[0]) {
      case 'minMax':
        return value >= converted[2] && value <= converted[3]
      case 'min':
        return value >= converted[2]
      case 'max':
        return value <= converted[2]
      default:
        throw new Error('wrong tag cmp type', converted)
    }
  }

  return value === converted
}
