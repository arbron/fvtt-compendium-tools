import constants from './shared/constants.js';
import { log, uiError } from './shared/messages.js';
import { Monkey } from './shared/Monkey.js';
import { CTSettings } from './settings.js';


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
    for (let cls of classesToPatch) {
      log(`Patching ${cls.name}.create`);

      Monkey.replaceFunction(cls, 'create', function(data, context={}) {
        if (context.pack && !game.user.isGM) {
          return Compendium._dispatchRemoteUpdate(cls.name, 'create', data, context);
        }
        return Monkey.callOriginalFunction(cls, 'create', data, context);
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
    for (let baseCls of classesToPatch) {
      const cls = CONFIG[baseCls.name].documentClass;
      log (`Patching ${cls.name}.update`);

      Monkey.replaceMethod(cls, 'update', function(data, context={}) {
        if (this.pack && !game.user.isGM) {
          context.uuid = this.uuid;
          return Compendium._dispatchRemoteUpdate(baseCls.name, 'update', data, context);
        }
        return Monkey.callOriginalFunction(this, 'update', data, context);
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


/**
 * Monkey patch private Compendium._assertUserCanModify method to respect
 * the bypass edit lock setting.
 */
export function patchCompendiumCanModify() {
  log('Patching Compendium._assertUserCanModify');

  Monkey.replaceMethod(Compendium, '_assertUserCanModify', function(options={}) {
    if (CTSettings.bypassEditLock) options.requireUnlocked = false;
    if (game.user.role < CTSettings.editUserLevel) {
      let err = new Error('You do not have permission to modify this compendium pack');
      ui.notifications.error(err.message);
      throw err;
    } else {
      options.requireGM = false;
    }
    return Monkey.callOriginalFunction(this, '_assertUserCanModify', options);
  });
}


/**
 * Monkey patch ModuleMangement.activateListeners to add the option of displaying
 * a context menu for each module.
 */
export function patchModuleMenus() {
  log('Patching ModuleManagement.activateListeners');

  const PatchedClass = Monkey.patchMethod(ModuleManagement, 'activateListeners', [
    { line: 6,
      original: '',
      replacement: '\n//Context menu for each entry\nthis._contextMenu(html);'
    }
  ]);
  if (!PatchedClass) return;

  ModuleManagement.prototype.activateListeners = PatchedClass.prototype.activateListeners;
  ModuleManagement.prototype._contextMenu = function(html) {
    const contextOptions = [];
    Hooks.callAll('ctGetModuleManagementItemContext', html, contextOptions);
    if (contextOptions) new ContextMenu(html, '.package', contextOptions);
  }
}
