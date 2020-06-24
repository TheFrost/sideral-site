import { gsap } from 'gsap/all'
import {
  $, $$,
  getBreakpointTagActive,
  isMobileDevice
} from '../tools/utils'

import placeholderAstronaut from '../../images/placeholder-astronaut.png'
import placeholderAlien from '../../images/placeholder-alien.png'
import placeholderOvni from '../../images/placeholder-ovni.png'
import placeholderEye from '../../images/placeholder-eye.png'

export default class PortfolioScroll {
  isMobileDevice = isMobileDevice()
  scrollDirection = 1
  scrollTimer = null
  isScrollOnTop = false
  isScrollOnBottom = false
  isScrollActive = false
  pageActive = 1
  data = null
  gridItems = 0
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
          <a href="#" class="portfolio__link first" data-index="0">
            <img src="" alt="" />
          </a>
          <a href="#" class="portfolio__link second" data-index="1">
            <img src="" alt="" />
          </a>
        </figure>
        <footer class="portfolio__footer">
          <div class="portfolio__info first" data-index="0">
            <span class="portfolio__meta name"></span>
            <span class="portfolio__meta place"></span>
          </div>
          <div class="portfolio__info second" data-index="1">
            <span class="portfolio__meta name"></span>
            <span class="portfolio__meta place"></span>
          </div>
        </footer>
      </article>
    </li>
  `

  placeholders = [
    placeholderEye,
    placeholderOvni,
    placeholderAlien,
    placeholderAstronaut
  ]

  getPlaceholder = () => (
    this.placeholders[
      Math.floor(Math.random() * this.placeholders.length)
    ]
  )

  constructor () {
    this.DOM = {
      main: $('.main'),
      list: $('.portfolio__list'),
      items: null,
      figures: null,
      links: null,
      scroller: $('.portfolio__fakescroll'),
      scrollAreas: null
    }
  }

  init () {
    this.setupGrid()
    this.setupDOMDynamicSelectors('items', $$('.portfolio__item'))
    this.setupDOMDynamicSelectors('links', $$('.portfolio__link'))
    this.setupDOMDynamicSelectors('figures', $$('.portfolio__fig'))
    this.fetch()
  }

  fetch () {
    window.fetch('https://sideral.mx/nuevo/wp-json/acf/v3/posts')
      .then(response => response.json())
      .then(response => this.setupPortfolioData(response))
  }

  setupPortfolioData (data) {
    const { items, scroller } = this.DOM

    items.map((item, index) => {
      const firstData = data[index]
      const secondData = data[index + (this.gridItems / 2)]

      const firstLink = $(item, '.portfolio__link.first')
      const firstImg = $(firstLink, 'img')
      const firstName = $(item, '.portfolio__info.first > .name')
      const firstPlace = $(item, '.portfolio__info.first > .place')

      const secondLink = $(item, '.portfolio__link.second')
      const secondImg = $(secondLink, 'img')
      const secondName = $(item, '.portfolio__info.second > .name')
      const secondPlace = $(item, '.portfolio__info.second > .place')

      if (firstData !== undefined) {
        // firstLink.setAttribute('href', `/work/${firstData.id}`)
        firstImg.setAttribute('src', firstData.acf.thumb || this.getPlaceholder())
        firstName.textContent = firstData.acf.project_name
        firstPlace.textContent = firstData.acf.origin_of_project
      }

      if (secondData !== undefined) {
        // secondLink.setAttribute('href', `/work/${secondData.id}`)
        secondImg.setAttribute('src', secondData.acf.thumb || this.getPlaceholder())
        secondName.textContent = secondData.acf.project_name
        secondPlace.textContent = secondData.acf.origin_of_project
      }
    })

    // setip scroll areas
    if (data.length <= this.gridItems) return
    const areas = Math.ceil((data.length - this.gridItems) / (this.gridItems / 2)) + 1
    let areasMarkup = ''
    for (let i = 0; i < areas; i++) {
      areasMarkup += '<div class="portfolio__fakescroll-area"></div>'
    }
    scroller.innerHTML = areasMarkup

    this.setupDOMDynamicSelectors(
      'scrollAreas',
      $$('.portfolio__fakescroll-area')
    )

    this.isScrollActive = true
    this.setupTweens()
    this.bindEvents()

    this.data = data
  }

  setupGrid () {
    const { list } = this.DOM
    this.gridItems = this.getGridItemsByResolution(getBreakpointTagActive())
    let markup = ''

    for (let i = 0; i < this.gridItems; i++) {
      markup += this.gridItemTemplate
    }

    list.innerHTML = markup
  }

  setupDOMDynamicSelectors (key, selector) {
    this.DOM[key] = selector
  }

  getGridItemsByResolution (resolution) {
    return this.gridItemsByResolution[resolution]
  }

  bindEvents () {
    const { main, scroller } = this.DOM

    if (!this.isMobileDevice && this.isScrollActive) {
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
          onLeave: () => {
            this.pageActive += 1

            const firstSelector = $$(first)
            const indexControl = ((this.gridItems / 2) * this.pageActive)

            firstSelector
              .filter(element => element.classList.contains('portfolio__link'))
              .map((element, index) => {
                const data = this.data[index + indexControl]

                if (data === undefined) return

                const img = $(element, 'img')
                img.setAttribute('src', data.acf.thumb || this.getPlaceholder())
              })
            firstSelector
              .filter(element => element.classList.contains('portfolio__info'))
              .map((element, index) => {
                const data = this.data[index + indexControl]

                if (data === undefined) return

                const name = $(element, '.name')
                const place = $(element, '.place')
                name.textContent = data.acf.project_name
                place.textContent = data.acf.origin_of_project
              })
          },
          onEnterBack: () => {
            this.pageActive -= 1

            const firstSelector = $$(first)
            const indexControl = ((this.gridItems / 2) * (this.pageActive - 1))

            firstSelector
              .filter(element => element.classList.contains('portfolio__link'))
              .map((element, index) => {
                const data = this.data[index + indexControl]

                if (data === undefined) return

                const img = $(element, 'img')
                img.setAttribute('src', data.acf.thumb || this.getPlaceholder())
              })
            firstSelector
              .filter(element => element.classList.contains('portfolio__info'))
              .map((element, index) => {
                const data = this.data[index + indexControl]

                if (data === undefined) return

                const name = $(element, '.name')
                const place = $(element, '.place')
                name.textContent = data.acf.project_name
                place.textContent = data.acf.origin_of_project
              })
          },
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
