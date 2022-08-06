import { log } from '../shared/messages.mjs';

export function fixMonksLittleDetailsConflict() {
  const module = game.modules.get('monks-little-details');
  if (module && module.active && isNewerVersion("1.0.17", module.data.version)) {
    log('Applying "Monk\'s Little Details" compatibility fix');

    Hooks.on('_getCompendiumEntryContext', (compendium, html, entryOptions) => {
      if (entryOptions.find(e => e.name === "View Scene Artwork")) return;

      entryOptions.unshift({
        name: "View Scene Artwork",
        icon: '<i class="fas fa-image fa-fw"></i>',
        condition: li => compendium.entity == 'Scene',
        callback: li => {
          let entryId = li.attr('data-entry-id');
          compendium.getEntity(entryId).then(entry => {
            let img = entry.data.img;
            if (VideoHelper.hasVideoExtension(img))
              ImageHelper.createThumbnail(img, { width: entry.data.width, height: entry.data.height }).then(img => {
                new ImagePopout(img.thumb, {
                  title: entry.name,
                  shareable: true,
                  uuid: entry.uuid
                }).render(true);
              });
            else {
              new ImagePopout(img, {
                title: entry.name,
                shareable: true,
                uuid: entry.uuid
              }).render(true);
            }
          });
        }
      });
    });
  }
}
