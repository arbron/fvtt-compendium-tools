import constants from './shared/constants.js';
import { registerPartial } from './shared/templates.js';


export class ModuleConfiguration extends FormApplication {
  constructor(moduleName, ...args) {
    super(...args);
    this.moduleName = moduleName;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: game.i18n.localize('ComepndiumTools.module.editModuleTitle'),
      id: 'module-configuration',
      template: `${constants.templateRoot}/moduleConfiguration.html`,
      width: 680,
      height: window.innerHeight - 100,
      classes: ['ct-module-configuration'],
      closeOnSubmit: true
    });
  }

  /** @override */
  get isEditable() {
    return false;
  }

  /** @override */
  getData(options) {
    const data = game.modules.get(this.moduleName).data;

    let traditionalScripts = data.scripts.map(script => {
      return { path: script, type: 'traditional' };
    });
    let moduleScripts = data.esmodules.map(script => {
      return { path: script, type: 'module' };
    });
    data.combinedScripts = traditionalScripts.concat(moduleScripts);

    return { module: data };
  }
}

export function prepareModuleConfigurationTemplates() {
  registerPartial('moduleAuthor', 'moduleAuthor.html');
  registerPartial('moduleConflict', 'moduleConflict.html');
  registerPartial('moduleDependency', 'moduleDependency.html');
  registerPartial('moduleInclude', 'moduleInclude.html');
  registerPartial('moduleLanguage', 'moduleLanguage.html');
  registerPartial('moduleMedia', 'moduleMedia.html');
  registerPartial('modulePack', 'modulePack.html');
  registerPartial('moduleScript', 'moduleScript.html');
  registerPartial('moduleStyle', 'moduleStyle.html');
}

/*
 * Required Manifest Attributes
 *  name
 *  title
 *  description
 *  version
 *  author
 *  minimumCoreVersion
 * 
 * Optional Manifest Attributes
 *  compatibleCoreVersion
 *  scripts
 *  esmodules
 *  styles
 *  packs
 *    name
 *    label
 *    system
 *    path
 *    entity
 *  dependencies
 *    name
 *    type
 *    manifest
 *  languages
 *    lang
 *    name
 *    path
 *  system
 *  authors
 *    name
 *    email
 *    url
 *  socket
 *  url
 *  manifest
 *  download
 *  license
 *  readme
 *  bugs
 *  changelog
 *
 * Manifest+ Attributes
 *  authors+
 *    discord
 *    twitter
 *    patreon
 *    reddit
 *  manifestPlusVersion (auto)
 *  media
 *    type - cover, icon, screenshot, video
 *    url
 *    loop (video only)
 *    thumbnail (video only)
 *  library
 *  includes
 *  deprecated
 *    coreVersion
 *    reason
 *    alternatives
 *      name
 *      manifest
 *  conflicts
 *    name
 *    type
 *    versionMin
 *    versionMax
 */
