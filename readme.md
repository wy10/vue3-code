--- 
iife => global
var VueReactive = (function(){
  return {
    reactive,
    computed,
    watch
  }
})()
--- 
cjs common.js
var reactive = function(){}
var computed = function(){}
var watch = funciton() {}
module.exports = {
  reactive,
  computed,
  watch
}
---
esm
var reactive = function() {}
var computed = function() {}
var watch = function() {}
export {
  reactive,
  computed,
  watch
}
---
