import { debounce } from 'lodash'
import ModuleManager from './moduleManager'
import Intro from './modules/intro'

window.addEventListener('load', () => {
  /**
   * Module manager setup
   */
  const moduleCatalogSetup = {
    general: [],
    home: [
      new Intro()
    ]
  }

  const moduleManager = new ModuleManager(moduleCatalogSetup)
  moduleManager.init()

  /**
   * Bind events global control
   */
  window.onresize = debounce(() => {
    moduleManager.resizeHandler()
  }, 100)
})
