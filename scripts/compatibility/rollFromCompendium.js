import { log } from '../shared/messages.js';
import { Monkey } from '../shared/Monkey.js';

export function fixRollFromCompendiumConflict() {
  const module = game.modules.get('roll-from-compendium');
  if (module && module.active) {
    log('Applying "Roll from Compendium" compatibility fix');
    import('../../../roll-from-compendium/scripts/roll-from-compendium.js').then(applyFix);
  }
}

function applyFix(module) {
  // Add new context menu item
  Hooks.on('_getCompendiumEntryContext', (compendium, html, entryOptions) => {
    entryOptions.unshift({
      name: 'Roll',
      icon: '<i class="fas fa-dice-d20"></i>',
      callback: li => {
        const mouseEvent = event
        const entryId = li.attr('data-entry-id')
        compendium.getEntity(entryId).then(item => {
          module.rollFromCompendium(item, mouseEvent)
        })
      },
    });
  });
}
