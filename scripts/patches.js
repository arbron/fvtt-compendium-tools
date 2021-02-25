import constants from './shared/constants.js';
import { log } from './shared/messages.js';
import { Monkey } from './shared/Monkey.js';
import { CTSettings } from './settings.js';


/**
 * Monkey patch Compendium.createEntity method to dispatch creation over socket
 * if user is not GM user.
 */
export function patchCompendiumCreateEntity() {
  log('Patching Compendium.createEntity');

  let PatchedClass = Compendium;
  PatchedClass = Monkey.patchMethod(PatchedClass, 'createEntity', [
    { line: 3,
      original: '',
      replacement: `if (!game.user.isGM) {
        game.socket.emit('${constants.socket}', {
          operation: 'createEntity',
          user: game.user.id,
          content: {
            type: this.collection,
            data: data,
            options: options
          }
        });
        return;
      }` }
  ]);
  if (!PatchedClass) return;
  Compendium.prototype.createEntity = PatchedClass.prototype.createEntity;
}


/**
 * Monkey patch Compendium.updateEntity method to dispatch update over socket
 * if user if not GM user.
 */
export function patchCompendiumUpdateEntity() {
  log('Patching Compendium.updateEntity');

  let PatchedClass = Compendium;
  PatchedClass = Monkey.patchMethod(PatchedClass, 'updateEntity', [
    { line: 17,
      original: '',
      replacement: `if (!game.user.isGM) {
        game.socket.emit('${constants.socket}', {
          operation: 'updateEntity',
          user: game.user.id,
          content: {
            type: this.collection,
            data: updates,
            options: options
          }
        });
        return;
      }` }
  ]);
  if (!PatchedClass) return;
  Compendium.prototype.updateEntity = PatchedClass.prototype.updateEntity;
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
      if (!game.user.isGM) {
        game.socket.emit('${constants.socket}', {
          operation: 'deleteEntity',
          user: game.user.id,
          content: {
            type: this.collection,
            data: ids,
            options: options
          }
        });
        return;
      }` }
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
 * Monkey patch private Compendium._contextMenu method to call a hook before
 * the context menu is generated.
 */
export function patchCompendiumMenus() {
  log('Patching Compendium._context_menu');

  let PatchedClass = Compendium;
  PatchedClass = Monkey.patchMethod(PatchedClass, '_contextMenu', [
    { line: 1,
      original:  'new ContextMenu(html, ".directory-item", [',
      replacement: 'return [' },
    { line: 25,
      original: ']);',
      replacement: '];' }
  ]);
  if (!PatchedClass) return;
  PatchedClass = Monkey.patchMethod(PatchedClass, 'activateListeners', [
    { line: 12,
      original: 'this._contextMenu(html);',
      replacement: 'this._ctContextMenu(html);'
    }
  ]);

  Compendium.prototype._getCompendiumContextOptions = PatchedClass.prototype._contextMenu;
  Compendium.prototype.activateListeners = PatchedClass.prototype.activateListeners;
  Compendium.prototype._ctContextMenu = function(html) {
    const contextOptions = this._getCompendiumContextOptions();
    Hooks.callAll('ctGetCompendiumItemContext', this, html, contextOptions);
    if (contextOptions) new ContextMenu(html, '.directory-item', contextOptions);
  };
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
