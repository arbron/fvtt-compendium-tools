import constants from './shared/constants.js';
import { log } from './shared/messages.js';

/**
 * The ReplaceEntry class provides an interface for replacing an entry
 * in a Compendium with another item of the same type.
 */
export class ReplaceEntry extends Application {
  constructor(compendium, entryId, options = {}) {
    options.top = compendium.position.top;
    options.left = ReplaceEntry._getLeftPosition(compendium.position);

    super(options);

    this.compendium = compendium;
    this.entryId = entryId;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: `${constants.templateRoot}/replaceEntry.html`,
      title: game.i18n.localize('CompendiumTools.ReplaceEntry'),
      width: constants.replaceEntryWidth,
      height: constants.replaceEntryHeight,
      classes: ['ct-replace-entry'],
      dragDrop: [{ dragSelector: '.directory-item', dropSelector: '.drop-area' }]
    });
  }

  static _getLeftPosition(position) {
    const right = position.left + position.width;
    if (right < window.innerWidth - constants.replaceEntryWidth + 60) {
      return right + 10;
    }

    return position.left - constants.replaceEntryWidth - 10;
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

    await this.close();
  }
}
