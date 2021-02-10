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
    const data = Object.assign({}, game.modules.get(this.moduleName).data);

    // Join scripts into single array split by type
    let traditionalScripts = data.scripts.map(script => {
      return { path: script, type: 'traditional' };
    });
    let moduleScripts = data.esmodules.map(script => {
      return { path: script, type: 'module' };
    });
    data.combinedScripts = traditionalScripts.concat(moduleScripts);

    data.isDeprecated = data.deprecated !== undefined;

    return { module: data };
  }
}

export function prepareModuleConfigurationTemplates() {
  registerPartial('moduleAlternative', 'moduleAlternative.html');
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
