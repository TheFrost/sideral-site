import curry from 'lodash.curry'
import deburr from 'lodash.deburr'
import kebabCase from 'lodash.kebabcase'
import Pubsub from './pubsub'

const query = (a) => document.querySelector(`[data-name="${a}"]`)

const setAttribute = curry((el, obj, name) => el.setAttribute(name, obj[name]))
const set = curry((el, obj, name) => (el[name] = obj[name]))
const not = curry((f, a) => !f(a))

const isCamelCase = (a) => a !== a.toLowerCase()

export function isElementPreset (dataName) {
  if (!dataName) return

  return query(dataName)
}

export function matches (elem, selector) {
  // Vendor-specific implementations of `Element.prototype.matches()`.
  const proto = window.Element.prototype
  const nativeMatches =
    proto.matches ||
    proto.mozMatchesSelector ||
    proto.msMatchesSelector ||
    proto.oMatchesSelector ||
    proto.webkitMatchesSelector

  if (!elem || elem.nodeType !== 1) {
    return false
  }

  const parentElem = elem.parentNode

  // use native 'matches'
  if (nativeMatches) {
    return nativeMatches.call(elem, selector)
  }

  // native support for `matches` is missing and a fallback is required
  const nodes = parentElem.querySelectorAll(selector)
  const len = nodes.length

  for (let i = 0; i < len; i++) {
    if (nodes[i] === elem) {
      return true
    }
  }

  return false
}

export function closest (element, selector, context = document) {
  element = { parentNode: element }

  while ((element = element.parentNode) && element !== context) {
    if (matches(element, selector)) {
      return element
    }
  }
}

export const ease = (a, b, c) => a + (b - a) * c

export function createElement (name, options = {}) {
  const {
    dataName,
    notAppend,
    parent = document.body,
    uniq = true,
    ...restOptions
  } = options

  const elFound = isElementPreset(dataName)
  if (uniq && elFound) return elFound

  const el = document.createElement(name)

  if (dataName) el.dataset.name = dataName

  Object.keys(restOptions).filter(isCamelCase).map(set(el, options))

  Object.keys(restOptions)
    .filter(not(isCamelCase))
    .map(setAttribute(el, options))

  if (!notAppend) parent.appendChild(el)

  return el
}

/**
 * Toggle class
 */
export const toggleClass = (el, ...classes) => {
  classes.map(className => el.classList.toggle(className))
}

/**
 * Pubsub pattern custom events
 */
export const pubsub = new Pubsub()

/**
 * simple querySelector methods
 */
// single selector
export const $ = (elementOrSelector, findSelector = null) => findSelector === null
  ? document.querySelector(elementOrSelector)
  : elementOrSelector.querySelector(findSelector)
// array selector
export const $$ = (selector) => [...document.querySelectorAll(selector)]

/**
 * Detect mobile device
 */
export const isMobileDevice = () => new RegExp(/Mobi/i).test(window.navigator.userAgent)

/**
 * Detect smartphone resolutions
 */
export const isSmartphone = () => {
  const { width, height } = window.screen
  return isMobileDevice() && Math.min(width, height) < 768
}

/**
 * Detect tablet resolutions
 */
export const isTablet = () => isMobileDevice() && !isSmartphone()

/**
 * Detect desktop resolution
 */
export const isDesktop = () => !isMobileDevice()

/**
 * Return tag breakpoint active ( sync with sass breakpoints )
 */
export const getBreakpointTagActive = () => {
  const width = window.innerWidth

  if (width >= 1900) return 'bp-hd-monitor'
  if (width >= 1280) return 'bp-laptop'
  if (width >= 1024) return 'bp-ipad-landscape'
  if (width >= 768) return 'bp-ipad-portrait'
  if (width >= 500) return 'bp-smartphone-landscape'
  if (width < 500) return 'bp-smartphone-portrait'
}

/**
 * Set Dynamic VH value
 */
export const setVHDynamicValue = () => {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

/**
 * Get slug format from string
 */
export const getSlug = (str) => kebabCase(deburr(str))

/**
 * Get DOM element from string template
 */
export const parseHTML = (str) => {
  const tmp = document.implementation.createHTMLDocument()
  tmp.body.innerHTML = str
  return tmp.body.children
}
