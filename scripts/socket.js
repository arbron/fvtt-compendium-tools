import constants from './shared/constants.js';
import { log } from './shared/messages.js';
import { CTSettings } from './settings.js';


export function setupSocketListeners() {
  game.socket.on(constants.socket, (data) => {
    if (data.operation == 'renderCompendium') {
      renderCompendium(data.content);
    }
    if (!game.user.isGM) return;
    switch (data.operation) {
      case 'create':
      case 'createEntity':
        executeRemoteOperation('create', data.content);
        break;
      case 'update':
      case 'updateEntity':
        executeRemoteOperation('update', data.content);
        break;
      case 'delete':
      case 'deleteEntity':
        executeRemoteOperation('delete', data.content);
        break;
      default:
        return;
    }
  });
}

function emitRenderCompendium(type) {
  game.socket.emit(constants.socket, {
    operation: 'renderCompendium',
    user: game.user.id,
    content: type
  });
}

async function renderCompendium(data) {
  const compendium = game.packs.get(data);
  if (compendium) compendium.render(false);
}

async function executeRemoteOperation(action, data) {
  // Only run the operation on the first GM user
  const gmUsers = game.users.filter(user => user.active && user.isGM);
  if (gmUsers[0].id != game.user.id) return;

  log(`Remote ${action} entity request received`);
  let compendiumName;

  if (CTSettings.is080) {
    if (action === 'create') {

      const documentClass = CONFIG[data.type].documentClass;
      await documentClass.create(data.data, data.context);

    } else {

      const doc = await fromUuid(data.context.uuid);
      let newContext = duplicate(data.context);
      newContext.uuid = undefined;
      if (action === 'update') {
        await doc.update(data.data, newContext);
      } else if (action === 'delete') {
        await doc.delete(newContext);
      } else {
        return;
      }

    }
    compendiumName = data.context.pack;
  } else {
    let message = duplicate(data);
    message.action = action;
    await SocketInterface.dispatch('modifyCompendium', message);
    compendiumName = message.type;
  }

  const compendium = game.packs.get(compendiumName);
  compendium.render(false);
  emitRenderCompendium(compendiumName);
}
