import gsap from 'gsap'
import { $, $$ } from '../tools/utils'

export default class SocialDropdown {
  timeline = null

  constructor () {
    this.DOM = {
      trigger: $('.header__section.trigger-social'),
      section: $('.header__section.contact'),
      items: $$('.social__item')
    }
  }

  init () {
    this.setup()
    this.bindEvents()
  }

  setup () {
    this.setupState()
    this.setupTimeline()
  }

  setupState () {
    const { section, items } = this.DOM

    gsap.set(section, { autoAlpha: 0 })
    gsap.set(items, {
      autoAlpha: 0,
      y: '-25%'
    })
  }

  setupTimeline () {
    const { section, items } = this.DOM

    this.timeline = gsap.timeline({ onComplete: () => section.classList.add('active') })
      .to(section, 0.17, {
        autoAlpha: 1
      })
      .to(items, 0.17, {
        y: '0%',
        autoAlpha: 1,
        stagger: 0.025
      }, '-=0.17')
      .reverse()
  }

  bindEvents () {
    const { trigger } = this.DOM

    trigger.addEventListener('click', () => this.tooggleDropdown())
  }

  tooggleDropdown () {
    this.timeline.reversed(!this.timeline.reversed())
  }
}
