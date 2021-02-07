import { log } from './shared/messages.js';
import { Monkey } from './shared/Monkey.js';
import { CTSettings } from './settings.js';

/**
 * Money patch private Compendium._assertUserCanModify method to respect
 * the bypass edit lock setting.
 */
export function patchCompendiumCanModify() {
  log('Patching Compendium._assertUserCanModify');

  Monkey.replaceMethod(Compendium, '_assertUserCanModify', function(options={}) {
    if (CTSettings.bypassEditLock) {
      options.requireUnlocked = false;
    }
    return Monkey.callOriginalFunction(this, '_assertUserCanModify', options);
  });
}


/**
 * Money patch private Compendium._contextMenu method to call a hook before
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
  Compendium.prototype._getCompendiumContextOptions = PatchedClass.prototype._contextMenu;
  Monkey.replaceMethod(Compendium, '_contextMenu', function(html) {
    const contextOptions = this._getCompendiumContextOptions();
    Hooks.call('ctGetCompendiumItemContext', this, html, contextOptions);
    if (contextOptions) new ContextMenu(html, '.directory-item', contextOptions);
  });
}
