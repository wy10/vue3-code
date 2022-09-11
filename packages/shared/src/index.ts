export function isObject(params:any) {
  return typeof params === 'object' && params !== null
}

export function isFunction(params:any) {
  return typeof params === 'function'
}

export function isArray(params:any) {
  return Array.isArray(params)
}

export function isString(params:any) {
  return typeof params === 'string'
}

export function isNumber(params:any) {
  return typeof params === 'number'
}

export const assign = Object.assign