import { TimelineMax } from 'gsap'
import { $ } from '../tools/utils'

export default class Intro {
  constructor () {
    this.DOM = {
      title: $('.intro__title > h1'),
      icon: $('.intro__icon > svg')
    }
  }

  init () {
    const { title, icon } = this.DOM
    const time = 3

    new TimelineMax()
      .to(title, time, {
        y: 0,
        ease: 'Expo.easeOut'
      })
      .to(icon, time, {
        y: 0,
        ease: 'Expo.easeOut'
      }, `-=${time * 0.8}`)
  }
}
