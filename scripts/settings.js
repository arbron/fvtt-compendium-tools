import constants from './shared/constants.js';
import { log } from './shared/messages.js';

const curryRegister = (module) => (key, data) => game.settings.register(module, key, data);
const register = curryRegister(constants.moduleName);

const ALLOW_MODULE_EDITING = 'allow-module-editing';
const BYPASS_EDIT_LOCK = 'bypass-edit-lock';

class Settings {
  init() {
    log('Registering settings');
    register(BYPASS_EDIT_LOCK, {
      name: game.i18n.localize('CompendiumTools.bypassEditLock.name'),
      hint: game.i18n.localize('CompendiumTools.bypassEditLock.hint'),
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });
    register(ALLOW_MODULE_EDITING, {
      name: game.i18n.localize('CompendiumTools.allowModuleEditing.name'),
      hint: game.i18n.localize('CompendiumTools.allowModuleEditing.hint'),
      scope: 'world',
      config: true,
      choices: {
        'all': game.i18n.localize('CompendiumTools.allowModuleEditing.all'),
        'local': game.i18n.localize('CompendiumTools.allowModuleEditing.local'),
        'none': game.i18n.localize('CompendiumTools.allowModuleEditing.none'),
      },
      default: 'local',
      type: String
    });
  }

  static _get(name) {
    return game.settings.get(constants.moduleName, name);
  }

  allowModuleEditing(isLocal = false) {
    switch (Settings._get(ALLOW_MODULE_EDITING)) {
      case 'all':
        return true;
      case 'local':
        return isLocal;
      case 'none':
        return false;
    }
  }

  get bypassEditLock() {
    return Settings._get(BYPASS_EDIT_LOCK);
  }
}

export const CTSettings = new Settings();
