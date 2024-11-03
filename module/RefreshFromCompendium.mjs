import constants from './shared/constants.mjs';
import { uiError } from './shared/messages.mjs';


/**
 * The RefreshFromCompendium class provides an interface for refreshing
 * an item stored in the world with any changes made to its source.
 */
export class RefreshFromCompendium extends Application {
  constructor(document, options = {}) {
    super(options);

    this.object = document;
  }

  /** @override */
  static get defaultOptions() {
    const mergeObject = foundry.utils?.mergeObject ?? globalThis.mergeObject;
    return mergeObject(super.defaultOptions, {
      template: `${constants.templateRoot}/refreshFromCompendium.hbs`,
      title: game.i18n.localize('CompendiumTools.RefreshTitle'),
      width: constants.refreshWidth,
      height: constants.refreshHeight,
      classes: ['ct-refresh-from-compendium'],
      dragDrop: [{ dragSelector: '.directory-item', dropSelector: '.drop-area' }]
    });
  }

  /** @inheritdoc */
  async getData() {
    const sourceId = this.object.getFlag("core", "sourceId");

    let sourceDocument;
    if ( sourceId && sourceId.startsWith("Compendium.") ) {
      sourceDocument = await fromUuid(sourceId);
    }

    return {
      name: this.object.name,
      needsSource: sourceDocument === undefined
    }
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", "button[name=refresh]", this._onRefresh.bind(this));
    html.on("click", "button[name=cancel]", this._onCancel.bind(this));
  }

  /**
   * Handle the click event on the refresh button.
   * @param {Event} event
   */
  async _onRefresh(event) {
    const sourceDocument = await fromUuid(this.object.getFlag("core", "sourceId"));
    let data = sourceDocument.toJSON();

    const changes = {
      "-=effects": null, "-=folder": null,
      "-=permission": null, "-=sort": null, "-=_id": null,
      "flags.core.sourceId": this.object.getFlag("core", "sourceId")
    };
    const mergeObject = foundry.utils?.mergeObject ?? globalThis.mergeObject;
    mergeObject(data, changes);

    this.object.update(data);
    return this.close();
  }

  /**
   * Handle the click event on the cancel button.
   * @param {Event} event
   */
  async _onCancel(event) {
    return this.close();
  }

  /**
   * Handle entry being dropped into a the Replace Entry interface
   */
  async _onDrop(event) {
    let data;
    try { data = JSON.parse(event.dataTransfer.getData('text/plain')); }
    catch (err) { return false; }

    // Ensure an entity type was indicated, types match, and pack exists
    if ( !data.type )
      throw new Error("You must define the type of entity being dropped");
    if ( data.type != this.object.documentName )
      return uiError("CompendiumTools.RefreshTypeError", false);
    if ( !data.pack )
      return uiError("CompendiumTools.RefreshSourcePackOnly", false);

    const uuid = `Compendium.${data.pack}.${data.id}`;

    await this.object.update({"flags.core.sourceId": uuid});
    return this.render();
  }
}
