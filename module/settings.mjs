import constants from './shared/constants.mjs';
import { log } from './shared/messages.mjs';

const curryRegister = (module) => (key, data) => game.settings.register(module, key, data);
const register = curryRegister(constants.moduleName);

const ALLOW_MODULE_EDITING = 'allow-module-editing';
const EDIT_USER_LEVEL = 'edit-user-level';

class Settings {
  init() {
    log('Registering settings');
    register(EDIT_USER_LEVEL, {
      name: game.i18n.localize('CompendiumTools.editUserLevel.name'),
      hint: game.i18n.localize('CompendiumTools.editUserLevel.hint'),
      scope: 'world',
      config: true,
      choices: {
        4: game.i18n.localize('USER.RoleGamemaster'),
        3: game.i18n.localize('USER.RoleAssistant'),
        2: game.i18n.localize('USER.RoleTrusted'),
        1: game.i18n.localize('USER.RolePlayer'),
      },
      default: 3,
      type: Number
    });
    if (constants._updateModuleFeatures) {
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

  get editUserLevel() {
    return Settings._get(EDIT_USER_LEVEL);
  }
}

export const CTSettings = new Settings();
