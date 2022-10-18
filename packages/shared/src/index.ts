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

export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTION_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTION_COMPONENT //异或运算 有一个1就是1
}

/**
 * 借助位的或|运算将元素组合在一起
 * 借助位的与&运算判断某个元素是否属于某一个组合 ElEMENT & COMPONENT = 0不属于
 */