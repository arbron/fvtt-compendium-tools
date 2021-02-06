import constants from './shared/constants.js';
import { log, uiError } from './shared/messages.js';

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
      title: game.i18n.localize('CompendiumTools.replace.title'),
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
      return false;
    }

    // Ensure an entity type was indicated
    if (!data.type) throw new Error("You must define the type of entity being dropped");

    if (data.type != this.compendium.entity) {
      uiError('CompendiumTools.replace.typeError', false);
      return;
    }

    // Get the dropped Entity
    const originalEntity = await this.compendium.getEntity(this.entryId);
    const replacementEntity = await this.compendium.cls.fromDropData(data);

    // Confirm types match and present confirmation dialog if they do not
    if (originalEntity.type != replacementEntity.type) {
      let confirmationDialog = new Dialog({
        title: game.i18n.localize('CompendiumTools.replace.subtypeMismatchTitle'),
        content: game.i18n.format('CompendiumTools.replace.subtypeMismatchWarning', {
          originalType: originalEntity.type,
          replacementType: replacementEntity.type
        }),
        buttons: {
          cancel: {
            icon: '',
            label: game.i18n.localize('CompendiumTools.replace.cancelButton'),
            callback: () => {}
          },
          replace: {
            icon: '',
            label: game.i18n.localize('CompendiumTools.replace.replaceButton'),
            callback: () => this._finalizeReplacement(replacementEntity)
          }
        },
        default: 'replace'
      });
      confirmationDialog.render(true);
    } else {
      this._finalizeReplacement(replacementEntity);
    }
  }

  /**
   * After all checks are done, perform the actual replacement in the Compendium.
   * @private
   */
  async _finalizeReplacement(entity) {
    // Update the existing entry
    let entityData = await entity.toCompendium();
    entityData._id = this.entryId;
    this.compendium.updateEntity(entityData);

    await this.close();
  }
}
