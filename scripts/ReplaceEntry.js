import constants from './shared/constants.js';
import { log } from './shared/messages.js';

/**
 * The ReplaceEntry class provides an interface for replacing an entry
 * in a Compendium with another item of the same type.
 */
export class ReplaceEntry extends Application {
  constructor(compendium, entryId, options) {
    super(options);

    this.compendium = compendium;
    this.entryId = entryId;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: `${constants.templateRoot}/replaceEntry.html`,
      title: game.i18n.localize('CompendiumTools.ReplaceEntry'),
      width: 400,
      height: 300,
      top: 120,
      left: 200,
      // TODO: Position relative to Compendium that opened it
      // Top = Compendium Top, Left = Compendium Right + 10
      // Unless Compendium is near the right side of screen, then position on left side
      classes: ['ct-replace-entry'],
      dragDrop: [{ dragSelector: '.directory-item', dropSelector: '.drop-area' }]
    });
  }

  /** @override */
  _canDragStart(selector) {
    return game.user.isGM;
  }

  /** @override */
  _canDragDrop(selector) {
    return game.user.isGM;
  }

  /**
   * Handle entry being dropped into a the Replace Entry interface
   */
  async _onDrop(event) {
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    }
    catch (err) {
      log('error processing data');
      return false;
    }

    // Ensure an entity type was indicated
    if (!data.type) throw new Error("You must define the type of entity being dropped");

    // Get the dropped Entity
    let entity = await this.compendium.cls.fromDropData(data);
    let entityData = await entity.toCompendium();

    // TODO: Verify replacement entity type matches replaced type

    // Update the existing entry
    entityData._id = this.entryId;
    this.compendium.updateEntity(entityData);

    // TODO: Provide comparison about replacement info and confirmation button
    // TODO: Automatically close window when complete
  }
}
