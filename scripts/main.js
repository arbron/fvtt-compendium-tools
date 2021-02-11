import constants from './shared/constants.js';
import { log } from './shared/messages.js';
import { fixRollFromCompendiumConflict } from './compatibility/rollFromCompendium.js';
import { ModuleConfiguration, prepareModuleConfigurationTemplates } from './ModuleConfiguration.js';
import { patchCompendiumCanModify, patchCompendiumMenus, patchModuleMenus } from './patches.js';
import { ReplaceEntry } from './ReplaceEntry.js';
import { CTSettings } from './settings.js';

Hooks.once('init', () => {
  CTSettings.init();
});

Hooks.on('setup', () => {
  patchCompendiumCanModify();
  patchCompendiumMenus();
  patchModuleMenus();

  fixRollFromCompendiumConflict();

  prepareModuleConfigurationTemplates();
});

Hooks.on('ready', () => {
  
});

Hooks.on('ctGetCompendiumItemContext', (compendium, html, menuOptions) => {
  let insertIndex = menuOptions.findIndex(element => element.name == 'COMPENDIUM.ImportEntry');
  menuOptions.splice(insertIndex + 1, 0, {
    name: 'CompendiumTools.replace.title',
    icon: '<i class="fas fa-sign-in-alt"></i>',
    callback: li => {
      const entryId = li.attr('data-entry-id');
      return new ReplaceEntry(compendium, entryId).render(true);
    }
  });
  return menuOptions;
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
