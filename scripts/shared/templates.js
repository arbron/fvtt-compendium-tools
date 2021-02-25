import constants from './constants.js';
import { log } from './messages.js';

export async function registerPartial(name, path) {
  const compiled = await getTemplate(`${constants.templateRoot}/${path}`);
  Handlebars.registerPartial(name, compiled);
}
