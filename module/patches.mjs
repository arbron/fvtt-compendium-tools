import constants from './shared/constants.mjs';
import { log, uiError } from './shared/messages.mjs';
import { Monkey } from './shared/Monkey.mjs';
import { CTSettings } from './settings.mjs';


/**
 * Add method to Compendium for sending out updates over socket.
 */
export function addCompendiumDispatchRemoteUpdate() {
  log('Adding Compendium._dispatchRemoteUpdate');

  Compendium._dispatchRemoteUpdate = function(type, operation, data, context={}) {
    if (game.users.filter(user => user.active && user.isGM).length == 0) {
      return uiError(game.i18n.localize('CompendiumTools.noGMUser'), /* toConsole */ false);
    }

    game.socket.emit(constants.socket, {
      operation: operation,
      user: game.user.id,
      content: {
        type: type,
        data: data,
        context: context
      }
    });
  }
}


const classesToPatch = [Actor, Item, Scene, JournalEntry, Macro, RollTable, Playlist];

/**
 * Monkey patch Compendium.createEntity method to dispatch creation over socket
 * if user is not GM user.
 */
export function patchCompendiumCreateEntity() {
  for (const baseCls of classesToPatch) {
    const cls = CONFIG[baseCls.name].documentClass;
    log(`Patching ${cls.name}.create`);

    Monkey.mix(`CONFIG.${baseCls.name}.documentClass.create`, function(wrapped, data, context={}) {
      if (context.pack && !game.user.isGM && game.user.role >= CTSettings.editUserLevel) {
        return Compendium._dispatchRemoteUpdate(baseCls.name, 'create', data, context);
      }
      return wrapped(data, context);
    });
  }
}


/**
 * Monkey patch Compendium.updateEntity method to dispatch update over socket
 * if user if not GM user.
 */
export function patchCompendiumUpdateEntity() {
  for (const baseCls of classesToPatch) {
    const cls = CONFIG[baseCls.name].documentClass;
    log(`Patching ${cls.name}.update`);

    Monkey.mix(`CONFIG.${baseCls.name}.documentClass.prototype.update`, function(wrapped, data, context={}) {
      if (this.pack && !game.user.isGM && game.user.role >= CTSettings.editUserLevel) {
        context.uuid = this.uuid;
        return Compendium._dispatchRemoteUpdate(baseCls.name, 'update', data, context);
      }
      return wrapped(data, context);
    });
  }
}


/**
 * Monkey patch Compendium.deleteEntity method to dispatch deletion over socket
 * if user if not GM user.
 */
export function patchCompendiumDeleteEntity() {
  for (let baseCls of classesToPatch) {
    const cls = CONFIG[baseCls.name].documentClass;
    log(`Patching ${cls.name}.delete`);

    Monkey.mix(`CONFIG.${baseCls.name}.documentClass.prototype.delete`, function(wrapped, context={}) {
      if (this.pack && !game.user.isGM && game.user.role >= CTSettings.editUserLevel) {
        context.uuid = this.uuid;
        return Compendium._dispatchRemoteUpdate(baseCls.name, 'delete', null, context);
      }
      return wrapped(context);
    });
  }
}
