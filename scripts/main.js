import constants from './shared/constants.js';
import { log } from './shared/messages.js';
import { fixMonksLittleDetailsConflict } from './compatibility/monksLittleDetails.js';
import { fixRollFromCompendiumConflict } from './compatibility/rollFromCompendium.js';
import { ModuleConfiguration, prepareModuleConfigurationTemplates } from './ModuleConfiguration.js';
import * as patches from './patches.js';
import { ReplaceEntry } from './ReplaceEntry.js';
import { CTSettings } from './settings.js';
import { setupSocketListeners } from './socket.js';

Hooks.once('init', () => {
  CTSettings.init();
});

Hooks.on('setup', () => {
  patches.addCompendiumDispatchRemoteUpdate();
  patches.patchCompendiumCreateEntity();
  patches.patchCompendiumUpdateEntity();
  patches.patchCompendiumDeleteEntity();
  patches.patchCompendiumCanModify();
  patches.patchModuleMenus();

  fixMonksLittleDetailsConflict();
  fixRollFromCompendiumConflict();

  prepareModuleConfigurationTemplates();

  setupSocketListeners();
});

Hooks.on('_getCompendiumEntryContext', (compendium, html, entryOptions) => {
  let insertIndex = entryOptions.findIndex(element => element.name == 'COMPENDIUM.ImportEntry');
  entryOptions.splice(insertIndex + 1, 0, {
    name: 'CompendiumTools.replace.title',
    icon: '<i class="fas fa-sign-in-alt"></i>',
    callback: li => {
      const entryId = li.attr('data-entry-id');
      return new ReplaceEntry(compendium, entryId).render(true);
    }
  });
});

Hooks.on('ctGetModuleManagementItemContext', (html, menuOptions) => {
  menuOptions.push({
    name: 'CompendiumTools.module.editModuleConfiguration',
    icon: '<i class="fas fa-edit"></i>',
    callback: li => {
      const moduleName = li.attr('data-module-name');
      return new ModuleConfiguration(moduleName).render(true);
    }
  }
  );
});
