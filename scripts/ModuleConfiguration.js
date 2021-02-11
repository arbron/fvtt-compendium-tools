import constants from './shared/constants.js';
import { parseFormData } from './shared/forms.js';
import { registerPartial } from './shared/templates.js';
import { CTSettings } from './settings.js';


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
    if (!constants._updateModuleFeatures) return false;

    const module = game.modules.get(this.moduleName).data;
    return (game.user.isGM && CTSettings.allowModuleEditing(/* isLocal */ module.manifest == ''));
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

    return { editable: this.isEditable, module: data };
  }

  _updateObject(event, data) {
    let parsedData = parseFormData(data);

    // Split scripts into separate arrays
    if (parsedData.combinedScripts) {
      parsedData.scripts = [];
      parsedData.esmodules = [];
      for (let script of parsedData.combinedScripts) {
        if (script.type == 'traditional') {
          parsedData.scripts.push(script.path);
        } else if (script.type == 'module') {
          parsedData.esmodules.push(script.path);
        }
      }
      delete parsedData.combinedScripts;
    }

    // TODO: Update module.json
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
