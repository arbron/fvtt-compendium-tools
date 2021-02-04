import { log } from './shared/messages.js';

/**
 * Money patch private Compendium._contextMenu method to call a hook before
 * the context menu is generated.
 */
export function patchCompendiumMenus() {
  log('Patching Compendium._context_menu');
  const compendiumContextMenu = Compendium.prototype._contextMenu;

  /**
   * Render the ContextMenu which applies to each compendium entry
   * @param html {jQuery}
   * @private
   */
  Compendium.prototype._contextMenu = function(html) {
    const menuOptions = [
      {
        name: "COMPENDIUM.ImportEntry",
        icon: '<i class="fas fa-download"></i>',
        callback: li => {
          const entryId = li.attr('data-entry-id');
          const entities = this.cls.collection;
          return entities.importFromCollection(this.collection, entryId, {}, {renderSheet: true});
        }
      },
      {
        name: "COMPENDIUM.DeleteEntry",
        icon: '<i class="fas fa-trash"></i>',
        callback: li => {
          let entryId = li.attr('data-entry-id');
          this.getEntity(entryId).then(entry => {
            return Dialog.confirm({
              title: `${game.i18n.localize("COMPENDIUM.DeleteEntry")} ${entry.name}`,
              content: game.i18n.localize("COMPENDIUM.DeleteConfirm"),
              yes: () => this.deleteEntity(entryId),
            });
          });
        }
      }
    ];
    Hooks.call('ctGetCompendiumItemContext', this, html, menuOptions);
    if (menuOptions) new ContextMenu(html, '.directory-item', menuOptions);
  };
}
