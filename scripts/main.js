import constants from './shared/constants.js';
import { log, uiError } from './shared/messages.js';
import { fixMonksLittleDetailsConflict } from './compatibility/monksLittleDetails.js';
import { fixRollFromCompendiumConflict } from './compatibility/rollFromCompendium.js';
import { ModuleConfiguration, prepareModuleConfigurationTemplates } from './ModuleConfiguration.js';
import * as patches from './patches.js';
import { RefreshFromCompendium } from './RefreshFromCompendium.js';
import { ReplaceEntry } from './ReplaceEntry.js';
import { CTSettings } from './settings.js';
import { setupSocketListeners } from './socket.js';


Hooks.once('init', () => {
  CTSettings.init();
});

Hooks.once('setup', () => {
  patches.addCompendiumDispatchRemoteUpdate();
  patches.patchCompendiumCreateEntity();
  patches.patchCompendiumUpdateEntity();
  patches.patchCompendiumDeleteEntity();
  if (!CTSettings.is080) patches.patchCompendiumCanModify();

  const contextMenuLibrary = game.modules.get('arbron-context-menus');
  if (contextMenuLibrary && isNewerVersion("0.2.0", contextMenuLibrary.data.version)) {
    patches.patchModuleMenus();
  }

  fixMonksLittleDetailsConflict();
  fixRollFromCompendiumConflict();

  prepareModuleConfigurationTemplates();

  setupSocketListeners();
});

Hooks.once('ready', () => {
  const contextMenuLibrary = game.modules.get('arbron-context-menus');
  if (game.user.isGM && !contextMenuLibrary || !contextMenuLibrary.active) {
    const present = contextMenuLibrary ? 'enabled' : 'present';
    uiError(`Context Menu Library not ${present}, Replace Entry will not work.`);

    const DONT_REMIND_AGAIN_KEY = 'context-menus-dont-remind-again';
    game.settings.register(constants.moduleName, DONT_REMIND_AGAIN_KEY, { name: '', default: false, type: Boolean, scope: 'world', config: false });
    if (!game.settings.get(constants.moduleName, DONT_REMIND_AGAIN_KEY)) {
      const instruction = contextMenuLibrary ? 'You can enable it from the "Module Management" screen in this world.' : 'You can install it from the "Add-on Modules" tab in the Foundry VTT Setup and then enable it from the "Module Management" screen in this world.';
      const message = `
        <p>Compendium Tools depends on <em>Arbron's Context Menu Library</em>, which is not ${present}.</p>
        <small><p>${instruction}</p></small>
      `;

      new Dialog({
        title: 'Context Menu Library Missing',
        content: message,
        buttons: {
          ok: { icon: '<i class="fas fa-check"></i>', label: 'Understood' },
          dont_remind: {
            icon: '<i class="fas fa-times"></i>',
            label: "Don't Remind Me Again",
            callback: () => game.settings.set(constants.moduleName, DONT_REMIND_AGAIN_KEY, true)
          }
        }
      }).render(true);
    }
  }
});


/* ----------------------------- */
/*         Context Menus         */
/* ----------------------------- */

Hooks.on('_getCompendiumEntryContext', (compendium, html, entryOptions) => {
  const canMakeChanges = () => game.user.isGM || (game.user.role >= CTSettings.editUserLevel);

  const insertIndex = entryOptions.findIndex(element => element.name == 'COMPENDIUM.ImportEntry');
  entryOptions.splice(insertIndex + 1, 0, {
    name: 'CompendiumTools.replace.title',
    icon: '<i class="fas fa-sign-in-alt"></i>',
    condition: canMakeChanges,
    callback: li => {
      const entryId = CTSettings.is080 ? li.attr('data-document-id') : li.attr('data-entry-id');
      return new ReplaceEntry(compendium, entryId).render(true);
    }
  });

  const deleteIndex = entryOptions.findIndex(element => element.name == 'COMPENDIUM.DeleteEntry');
  entryOptions[deleteIndex].condition = canMakeChanges;
});

if (constants._refreshFromCompendiumFeatures) {
  for ( const type of [ItemDirectory] ) {
    Hooks.on(`get${type.name}EntryContext`, (html, entryOptions) => {
      const insertIndex = entryOptions.findIndex(e => e.name === "SIDEBAR.Export");
      entryOptions.splice(insertIndex, 0, {
        name: "CompendiumTools.RefreshTitle",
        icon: '<i class="fas fa-sync"></i>',
        callback: li => {
          const document = type.collection.get(li.data("entityId"));
          return new RefreshFromCompendium(document).render(true);
        }
      });
    });
  }
}

Hooks.on('ctGetModuleManagementItemContext', moduleManagementContextEntries);
Hooks.on('_getModuleManagementEntryContext', moduleManagementContextEntries);
function moduleManagementContextEntries(html, entryOptions) {
  entryOptions.push({
    name: 'CompendiumTools.module.editModuleConfiguration',
    icon: '<i class="fas fa-edit"></i>',
    callback: li => {
      const moduleName = li.attr('data-module-name');
      return new ModuleConfiguration(moduleName).render(true);
    }
  });
}
