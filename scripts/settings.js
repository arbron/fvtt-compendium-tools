import constants from './shared/constants.js';
import { log } from './shared/messages.js';

const curryRegister = (module) => (key, data) => game.settings.register(module, key, data);
const register = curryRegister(constants.moduleName);

const BYPASS_EDIT_LOCK = 'bypass-edit-lock';

class Settings {
  init() {
    log('Registering settings');
    const localize = game.i18n.localize;
    register(BYPASS_EDIT_LOCK, {
      name: game.i18n.localize('CompendiumTools.bypassEditLock.name'),
      hint: game.i18n.localize('CompendiumTools.bypassEditLock.hint'),
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });
  }

  static _get(name) {
    return game.settings.get(constants.moduleName, name);
  }

  get bypassEditLock() {
    return Settings._get(BYPASS_EDIT_LOCK);
  }
}

export const CTSettings = new Settings();
