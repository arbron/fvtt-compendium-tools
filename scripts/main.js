import constants from './shared/constants.js';
import { log } from './shared/messages.js';
import { patchCompendiumMenus } from './patches.js';
import { addCompendiumOptions } from './menus.js';

Hooks.on('init', () => {
  
});

Hooks.on('setup', () => {
  patchCompendiumMenus();
});

Hooks.on('ready', () => {
  
});

Hooks.on('ctGetCompendiumItemContext', (html, menuOptions) => {
  let insertIndex = menuOptions.findIndex(element => element.name == 'COMPENDIUM.ImportEntry');
  menuOptions.splice(insertIndex + 1, 0, {
    name: 'CompendiumTools.ReplaceEntry',
    icon: '<i class="fas fa-sign-in-alt"></i>',
    callback: li => {
      log('Replace Pressed');
    }
  });
  return menuOptions;
});
