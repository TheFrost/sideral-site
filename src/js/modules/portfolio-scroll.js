import { gsap } from 'gsap/all'
import {
  $, $$,
  getBreakpointTagActive,
  isMobileDevice
} from '../tools/utils'

export default class PortfolioScroll {
  isMobileDevice = isMobileDevice()
  scrollDirection = 1
  scrollTimer = null
  isScrollOnTop = false
  isScrollOnBottom = false
  gridItemsByResolution = {
    'bp-hd-monitor': 8,
    'bp-laptop': 8,
    'bp-ipad-landscape': 4,
    'bp-ipad-portrait': 4,
    'bp-smartphone-landscape': 2,
    'bp-smartphone-portrait': 2
  }

  gridItemTemplate = /* html */`
    <li class="portfolio__item">
      <article class="portfolio__container">
        <figure class="portfolio__fig">
          <a href="/index.html" class="portfolio__link first" data-index="0">
            <img src="https://sideral.mx/nuevo/wp-content/uploads/2020/06/CASOLAMICHOACANA_1.jpg" alt="" />
          </a>
          <a href="#2" class="portfolio__link second" data-index="1">
            <img src="https://sideral.mx/nuevo/wp-content/uploads/2020/06/CASOGG_1.jpg" alt="" />
          </a>
        </figure>
        <footer class="portfolio__footer">
          <div class="portfolio__info first" data-index="0">
            <span class="portfolio__meta">Mezcal Sta. Maria</span>
            <span class="portfolio__meta">Puebla, Pue.</span>
          </div>
          <div class="portfolio__info second" data-index="1">
            <span class="portfolio__meta">Mezcal Sta. Maria</span>
            <span class="portfolio__meta">Puebla, Pue.</span>
          </div>
        </footer>
      </article>
    </li>
  `

  constructor () {
    this.DOM = {
      main: $('.main'),
      list: $('.portfolio__list'),
      figures: null,
      links: null,
      scroller: $('.portfolio__fakescroll'),
      scrollAreas: $$('.portfolio__fakescroll-area').slice(0, -1)
    }
  }

  init () {
    this.setupGrid()
    this.setupDOMDynamicSelectors()
    this.setupTweens()
    this.bindEvents()
  }

  setupGrid () {
    const { list } = this.DOM
    const gridItems = this.getGridItemsByResolution(getBreakpointTagActive())
    let markup = ''

    for (let i = 0; i < gridItems; i++) {
      markup += this.gridItemTemplate
    }

    list.innerHTML = markup
  }

  setupDOMDynamicSelectors () {
    this.DOM.figures = $$('.portfolio__fig')
    this.DOM.links = $$('.portfolio__link')
  }

  getGridItemsByResolution (resolution) {
    return this.gridItemsByResolution[resolution]
  }

  bindEvents () {
    const { main, scroller } = this.DOM

    if (!this.isMobileDevice) {
      main.addEventListener('wheel', (e) => this.wheelHandler(e), { passive: true })
    }

    if (this.isMobileDevice) {
      scroller.addEventListener('click', (e) => this.scrollerClickHandler(e))
    }
  }

  isCollapsed ({ x, y }, element) {
    const { top, left, width, height } = element.getBoundingClientRect()
    const right = left + width
    const bottom = top + height

    return (
      x > left && x < right &&
      y > top && y < bottom
    )
  }

  scrollerClickHandler ({ clientX: x, clientY: y }) {
    const { figures, links } = this.DOM

    const someFigureCollapsed = figures.some(fig => this.isCollapsed({ x, y }, fig))

    if (someFigureCollapsed) {
      links.filter(link => this.isCollapsed({ x, y }, link))[0].click()
    }
  }

  wheelHandler ({ deltaY }) {
    this.setScrollDirection(deltaY)

    if (
      (this.scrollDirection === 1 && this.isScrollOnBottom) ||
      (this.scrollDirection === -1 && this.isScrollOnTop)
    ) return

    this.setScrollLayerPosition('up')
  }

  setScrollDirection (delta) {
    this.scrollDirection = delta > 0 ? 1 : -1
  }

  restartScrollTimer (callback) {
    window.clearTimeout(this.scrollTimer)
    this.scrollTimer = window.setTimeout(() => callback(), 66)
  }

  setScrollLayerPosition (position) {
    const { scroller } = this.DOM
    const positionValue = { up: 10, under: -1 }

    scroller.style.zIndex = positionValue[position]
  }

  setupTweens () {
    const { scrollAreas } = this.DOM
    let binary = 0

    scrollAreas.map((area, index) => {
      const first = `[data-index="${binary}"]`
      const second = `[data-index="${+!binary}"]`

      binary = +!binary

      gsap.timeline({
        scrollTrigger: {
          scroller: '.portfolio__fakescroll',
          trigger: area,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          ...(!this.isMobileDevice
            ? {
              onUpdate: () => this.restartScrollTimer(() => this.setScrollLayerPosition('under')),
              ...(
                index === 0
                  ? {
                    onUpdate: ({ progress }) => {
                      this.isScrollOnTop = progress === 0
                      this.restartScrollTimer(() => this.setScrollLayerPosition('under'))
                    }
                  }
                  : {}
              ),
              ...(
                index === scrollAreas.length - 1
                  ? {
                    onUpdate: ({ progress }) => {
                      this.isScrollOnBottom = progress > 0.95
                      this.restartScrollTimer(() => this.setScrollLayerPosition('under'))
                    }
                  }
                  : {}
              )
            }
            : {}
          )
        }
      })
        .fromTo(first, { y: '0%' }, {
          y: '-100%',
          z: 0.01,
          ease: 'Expo.easeInOut',
          stagger: 0.01
        })
        .fromTo(second, { y: '100%' }, {
          y: '0%',
          z: 0.01,
          ease: 'Expo.easeInOut',
          stagger: 0.01
        }, '<')
    })
  }
}
