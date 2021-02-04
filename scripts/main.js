import constants from './shared/constants.js';
import { log } from './shared/messages.js';
import { patchCompendiumCanModify, patchCompendiumMenus } from './patches.js';
import { ReplaceEntry } from './ReplaceEntry.js';
import { CTSettings } from './settings.js';

Hooks.once('init', () => {
  CTSettings.init();
});

Hooks.on('setup', () => {
  patchCompendiumCanModify();
  patchCompendiumMenus();
});

Hooks.on('ready', () => {
  
});

Hooks.on('ctGetCompendiumItemContext', (compendium, html, menuOptions) => {
  let insertIndex = menuOptions.findIndex(element => element.name == 'COMPENDIUM.ImportEntry');
  menuOptions.splice(insertIndex + 1, 0, {
    name: 'CompendiumTools.ReplaceEntry',
    icon: '<i class="fas fa-sign-in-alt"></i>',
    callback: li => {
      const entryId = li.attr('data-entry-id');
      return new ReplaceEntry(compendium, entryId).render(true);
    }
  });
  return menuOptions;
});
