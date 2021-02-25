import constants from './shared/constants.js';
import { log } from './shared/messages.js';


export function setupSocketListeners() {
  game.socket.on(constants.socket, (data) => {
    if (data.operation == 'renderCompendium') {
      renderCompendium(data.content);
    }
    if (!game.user.isGM) return;
    switch (data.operation) {
      case 'createEntity':
        executeRemoteOperation('create', data.content);
        break;
      case 'updateEntity':
        executeRemoteOperation('update', data.content);
        break;
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

  let message = duplicate(data);
  message.action = action;

  const response = await SocketInterface.dispatch('modifyCompendium', message);
  const compendium = game.packs.get(message.type);
  compendium.render(false);

  emitRenderCompendium(message.type);
}
