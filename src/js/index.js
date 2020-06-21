import { debounce } from 'lodash'
import { isDesktop, setVHDynamicValue } from './tools/utils'
import ModuleManager from './moduleManager'
import CustomCursor from './modules/custom-cursor'

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
        ] : []
    ],
    home: []
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
