import constants from './shared/constants.mjs';
import { log, uiError } from './shared/messages.mjs';
import { Monkey } from './shared/Monkey.mjs';
import { CTSettings } from './settings.mjs';


/**
 * Add method to Compendium for sending out updates over socket.
 */
export function addCompendiumDispatchRemoteUpdate() {
  log('Adding Compendium._dispatchRemoteUpdate');

  if (CTSettings.is080) {
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
  } else {
    Compendium.prototype._dispatchRemoteUpdate = function(operation, data, options={}) {
      if (game.users.filter(user => user.active && user.isGM).length == 0) {
        return uiError(game.i18n.localize('CompendiumTools.noGMUser'), /* toConsole */ false);
      }

      game.socket.emit(constants.socket, {
        operation: operation,
        user: game.user.id,
        content: {
          type: this.collection,
          data: data,
          options: options
        }
      });
    }
  }
}


const classesToPatch = [Actor, Item, Scene, JournalEntry, Macro, RollTable, Playlist];

/**
 * Monkey patch Compendium.createEntity method to dispatch creation over socket
 * if user is not GM user.
 */
export function patchCompendiumCreateEntity() {
  if (CTSettings.is080) {
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
  } else {
    log('Patching Compendium.createEntity');

    let PatchedClass = Compendium;
    PatchedClass = Monkey.patchMethod(PatchedClass, 'createEntity', [
      { line: 3,
        original: '',
        replacement: `
          if (!game.user.isGM) return this._dispatchRemoteUpdate('createEntity', data, options);
        ` }
    ]);
    if (!PatchedClass) return;
    Compendium.prototype.createEntity = PatchedClass.prototype.createEntity;
  }
}


/**
 * Monkey patch Compendium.updateEntity method to dispatch update over socket
 * if user if not GM user.
 */
export function patchCompendiumUpdateEntity() {
  if (CTSettings.is080) {
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
  } else {
    log('Patching Compendium.updateEntity');

    let PatchedClass = Compendium;
    PatchedClass = Monkey.patchMethod(PatchedClass, 'updateEntity', [
      { line: 17,
        original: '',
        replacement: `
          if (!game.user.isGM) return this._dispatchRemoteUpdate('updateEntity', updates, options);
        ` }
    ]);
    if (!PatchedClass) return;
    Compendium.prototype.updateEntity = PatchedClass.prototype.updateEntity;
  }
}


/**
 * Monkey patch Compendium.deleteEntity method to dispatch deletion over socket
 * if user if not GM user.
 */
export function patchCompendiumDeleteEntity() {
  if (CTSettings.is080) {
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
  } else {
    log('Patching Compendium.deleteEntity');

    let PatchedClass = Compendium;
    PatchedClass = Monkey.patchMethod(PatchedClass, 'deleteEntity', [
      { line: 2,
        original: 'const ids = id instanceof Array ? id : [id];',
        replacement: `const ids = id instanceof Array ? id : [id];
          if (!game.user.isGM) return this._dispatchRemoteUpdate('deleteEntity', ids, options);
        ` }
    ]);
    if (!PatchedClass) return;
    Compendium.prototype.deleteEntity = PatchedClass.prototype.deleteEntity;
  }
}


/**
 * Monkey patch private Compendium._assertUserCanModify method to respect
 * the bypass edit lock setting. For pre-0.8.0 only.
 */
export function patchCompendiumCanModify() {
  log('Patching Compendium._assertUserCanModify');

  Monkey.mix("Compendium.prototype._assertUserCanModify", function(wrapped, options={}) {
    if (CTSettings.bypassEditLock) options.requireUnlocked = false;
    if (game.user.role < CTSettings.editUserLevel) {
      let err = new Error('You do not have permission to modify this compendium pack');
      ui.notifications.error(err.message);
      throw err;
    } else {
      options.requireGM = false;
    }
    return wrapped(options);
  });
}
