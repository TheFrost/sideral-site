import createElement, { closest, ease } from '../tools/utils'

export default class CustomCursor {
  props = {
    cursor: 'none',
    radius: 40,
    borderWidth: 1,
    lockTriggers: 'a, button',
    isLinkHover: null,
    ease: 0.6,
    lockTravel: 0.2,
    lockEase: 0.2,
    x: 0,
    y: 0,
    _x: 0,
    _y: 0,
    lx: 0,
    ly: 0,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    width: 0,
    height: 0,

    timestamp: null
  };

  elements = {};

  constructor () {
    const defaultXValue = this.props.x || window.innerWidth / 2
    const defaultYValue = this.props.y || window.innerHeight / 2

    Object.assign(
      {},
      this.props,
      { x: defaultXValue, _x: defaultXValue, lx: defaultXValue },
      { y: defaultYValue, _y: defaultYValue, ly: defaultYValue }
    )
  }

  init () {
    // set cursor: 'none' global
    document.documentElement.style.cursor = this.props.cursor

    this.elements.root = createElement('div', { className: 'cursor' })

    this.elements.circle_anim = createElement('div', {
      className: 'cursor__circle-anim',
      innerHTML: '<svg><circle cx="30" cy="30" r="28.5"></circle></svg>',
      parent: this.elements.root
    })

    this.elements.circle = createElement('div', {
      parent: this.elements.root,
      className: 'cursor__circle',
      style: `width: ${this.props.radius}px; height: ${this.props.radius}px; border-radius: ${this.props.radius}px; border-width: ${this.props.borderWidth}px;`
    })

    this.elements.inner = createElement('div', {
      className: 'cursor__inner',
      innerHTML: null,
      parent: this.elements.circle
    })

    this.props.timestamp = Date.now()

    this.hookCSSVars()
    this.handleEvents()

    this.update()
  }

  handleEvents ({ removeEvents = false } = {}) {
    const method = (removeEvents ? 'remove' : 'add') + 'EventListener'

    document[method]('mousemove', this.onMouseMove)
    document[method]('mousedown', this.onMouseDown)
    document[method]('mouseup', this.onMouseUp)
  }

  onMouseDown = () => {
    this.props.isDown = true
  }

  onMouseUp = () => {
    this.props.isDown = false
  }

  onMouseMove = (event) => {
    const ev = event.touches ? event.touches[0] : event
    this.props._x = ev.clientX
    this.props._y = ev.clientY

    this.onHover(event)
  }

  onHover = ({ target: el }) => {
    if (closest(el, this.props.lockTriggers)) {
      this.elements.circle_anim.classList.add('--is-link-hover')
      this.props.isLinkHover = true
    } else {
      this.elements.circle_anim.classList.remove('--is-link-hover')
      this.props.isLinkHover = false
    }
  }

  update = () => {
    const targetX = this.props._x
    const targetY = this.props._y

    this.props.x = ease(this.props.x, targetX, this.props.ease)
    this.props.y = ease(this.props.y, targetY, this.props.ease)

    const distX = this.props.x - this.props.lx
    const distY = this.props.y - this.props.ly

    this.props.dx =
      Math.floor(100 * ease(this.props.dx, distX, this.props.ease)) / 100
    this.props.dy =
      Math.floor(100 * ease(this.props.dy, distY, this.props.ease)) / 100

    const now = Date.now()
    const delta = now - this.props.timestamp

    this.props.timestamp = now

    this.props.vx = Math.min(Math.abs(this.props.dx) / delta, 2)
    this.props.vy = Math.min(Math.abs(this.props.dy) / delta, 2)

    this.props.rotation = Math.atan2(this.props.dy, this.props.dx)

    let targetWidth = this.props.radius
    let targetHeight = this.props.radius

    this.props.lockBg = '--transparent'

    if (this.props.isDown) {
      targetWidth = targetWidth - 10
      targetHeight = targetHeight - 10
    }

    if (this.props.isLinkHover) {
      targetWidth = targetWidth - 25
      targetHeight = targetHeight - 25
    }

    this.props.width =
      Math.round(
        10 * ease(this.props.width, targetWidth, this.props.lockEase)
      ) / 10
    this.props.height =
      Math.round(
        10 * ease(this.props.height, targetHeight, this.props.lockEase)
      ) / 10

    this.props.lx = this.props.x
    this.props.ly = this.props.y

    this.render()
  }

  render = () => {
    this.elements.root.style.setProperty('--width', this.props.width)
    this.elements.root.style.setProperty('--height', this.props.height)
    this.elements.root.style.setProperty('--x', this.props.x)
    this.elements.root.style.setProperty('--y', this.props.y)
    this.elements.root.style.setProperty('--vx', this.props.vx)
    this.elements.root.style.setProperty('--vy', this.props.vy)
    this.elements.root.style.setProperty('--dx', this.props.dx)
    this.elements.root.style.setProperty('--dy', this.props.dy)
    this.elements.root.style.setProperty('--rotation', this.props.rotation)
    this.elements.root.style.setProperty('--linkBg', 'transparent')
  }

  hookCSSVars () {
    this.elements.root.style.transform =
      'translate( calc( var(--dx) * -1px ), calc( var(--dy) * -1px ) ) translate3d( calc( var(--x) * 1px ), calc( var(--y) * 1px ), 0px )'
    this.elements.circle.style.transform =
      'translate3d( -50%, -50%, 0px ) translate( calc( var(--vx) * -4% ), calc( var(--vy) * -4% ) ) rotate( calc( var(--rotation) * 1rad) ) scaleX( calc( var(--vx)/2 + var(--vy)/2 + 1 ) )'
    this.elements.circle.style.width = 'calc( var(--width) * 1px )'
    this.elements.circle.style.height = 'calc( var(--height) * 1px )'
    this.elements.circle.style.backgroundColor = 'var(--linkBg)'
    this.elements.inner.style.transform =
      'translate(-50%, -50%) rotate(calc( var(--rotation) * -1rad) '
    this.render()
  }

  cleanup = () => {
    this.handleEvents({ removeEvents: true })
  }
}
