import { $, pubsub } from './tools/utils'

export default class ModuleManager {
  constructor (moduleCatalogSetup) {
    this.moduleCatalogSetup = moduleCatalogSetup
    this.currentScopeModules = []
  }

  init () {
    this.setupModules('general') // force general setup
    this.setupModules() // setup scope view modules
    this.bindEvents()
  }

  bindEvents () {
    pubsub.suscribe('manager:setup', this.setupModules, this)
    pubsub.suscribe('manager:dispose', this.disposeModules, this)
  }

  setupModules (forcedScope) {
    const { moduleScope } = $('.wrapper').dataset
    const scope = forcedScope || moduleScope

    this.currentScopeModules = this.moduleCatalogSetup[scope] || []

    if (this.currentScopeModules.length > 0) {
      this.currentScopeModules.map(module => module.init ? module.init() : null)
    }
  }

  disposeModules () {
    this.currentScopeModules.map(module => module.dispose ? module.dispose() : null)
  }

  resizeHandler () {
    const { general } = this.moduleCatalogSetup
    const modules = [...general, ...this.currentScopeModules]

    modules.map(module => module.resize ? module.resize() : null)
  }
}
