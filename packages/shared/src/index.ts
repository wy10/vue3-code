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

export function hasOwn(value,key) {
  const hasOwnProperty = Object.prototype.hasOwnProperty
  return hasOwnProperty.call(value,key)
}

export const assign = Object.assign

export const enum ShapeFlags {
  ELEMENT = 1,   //元素
  FUNCTION_COMPONENT = 1 << 1,  //函数式组件
  STATEFUL_COMPONENT = 1 << 2,  //普通组件
  TEXT_CHILDREN = 1 << 3,       //孩子是文本
  ARRAY_CHILDREN = 1 << 4,      //孩子是数组
  SLOTS_CHILDREN = 1 << 5,      //组件插槽
  TELEPORT = 1 << 6,            //teleport组件
  SUSPENSE = 1 << 7,            //suspense组件
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,  
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTION_COMPONENT //异或运算 有一个1就是1
}

/**
 * 借助位的或|运算将元素组合在一起
 * 借助位的与&运算判断某个元素是否属于某一个组合 ElEMENT & COMPONENT = 0不属于
 * 100
 * 010
 * 110 = 6
 * 
 * 110 & 100 = 100 true  说明STATEFUL_COMPONENT在COMPONENT中
 * 110 & 001 = 0   false ELEMENT不在COMPONENT中
 */