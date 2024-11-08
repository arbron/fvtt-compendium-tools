import constants from './shared/constants.mjs';
import { log, uiError } from './shared/messages.mjs';
import { CTSettings } from './settings.mjs';

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
    const mergeObject = foundry.utils?.mergeObject ?? globalThis.mergeObject;
    return mergeObject(super.defaultOptions, {
      template: `${constants.templateRoot}/replaceEntry.hbs`,
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
   * Fetch document for the provided ID.
   * @return {Document}
   */
  async _getDocument(id) {
    return this.compendium.collection.getDocument(id);
  }

  /**
   * Fetch item from drop data.
   */
  async _fromDropData(data) {
    return this.compendium.collection.documentClass.fromDropData(data);
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

    let entityType;
    if ( game.release.generation < 10 ) entityType = this.compendium.collection.metadata.entity;
    else entityType = this.compendium.collection.metadata.type;
    if (data.type != entityType) {
      uiError('CompendiumTools.replace.typeError', false);
      return;
    }

    // Get the dropped Entity
    const originalDocument = await this._getDocument(this.entryId);
    const replacementDocument = await this._fromDropData(data);

    // Confirm types match and present confirmation dialog if they do not
    const originalType = originalDocument.type ?? originalDocument.data.type;
    const replacementType = replacementDocument.type ?? replacementDocument.data.type;
    if (originalType != replacementType) {
      let confirmationDialog = new Dialog({
        title: game.i18n.localize('CompendiumTools.replace.subtypeMismatchTitle'),
        content: game.i18n.format('CompendiumTools.replace.subtypeMismatchWarning', {
          originalType: game.i18n.localize(CONFIG[entityType].typeLabels[originalType]),
          replacementType: game.i18n.localize(CONFIG[entityType].typeLabels[replacementType])
        }),
        buttons: {
          replace: {
            icon: '',
            label: game.i18n.localize('CompendiumTools.replace.replaceButton'),
            callback: () => this._finalizeReplacement(originalDocument, replacementDocument)
          },
          cancel: {
            icon: '',
            label: game.i18n.localize('CompendiumTools.replace.cancelButton'),
            callback: () => {}
          }
        },
        default: 'replace'
      });
      confirmationDialog.render(true);
    } else {
      this._finalizeReplacement(originalDocument, replacementDocument);
    }
  }

  /**
   * After all checks are done, perform the actual replacement in the Compendium.
   * @private
   */
  async _finalizeReplacement(original, replacement) {
    let entityData = await replacement.toCompendium();
    original.update(entityData);

    await this.close();
  }
}
