import { gsap, ScrollTrigger } from 'gsap/all'
import { debounce } from 'lodash'
import { isSmartphone, isDesktop, setVHDynamicValue } from './tools/utils'
import ModuleManager from './moduleManager'
import CustomCursor from './modules/custom-cursor'
import PortfolioScroll from './modules/portfolio-scroll'
import Project from './modules/project'
import SocialDropdown from './modules/social-dropdown'

import '../images/share.png'

// setup GSAP Plugins
gsap.registerPlugin(ScrollTrigger)

// set type device on markup
if (isSmartphone()) document.body.classList.add('smartphone-device')
if (isDesktop()) document.body.classList.add('desktop-device')

// set VH value
setVHDynamicValue()

window.addEventListener('load', () => {
  /**
   * Module manager setup
   */
  const moduleCatalogSetup = {
    general: [
      // only desktop
      ...isDesktop()
        ? [
          new CustomCursor()
        ] : [],
      // only smartphone
      ...isSmartphone()
        ? [
          new SocialDropdown()
        ] : []
    ],
    home: [],
    work: [
      new PortfolioScroll()
    ],
    project: [
      new Project()
    ]
  }

  const moduleManager = new ModuleManager(moduleCatalogSetup)
  moduleManager.init()

  const bindEvents = () => {
    window.onresize = debounce(() => {
      moduleManager.resizeHandler()
      setVHDynamicValue()
    }, 100)
  }

  const render = () => {
    moduleManager.update()
    if (moduleManager.needsUpdate) window.requestAnimationFrame(render)
  }

  bindEvents()
  render()
})
