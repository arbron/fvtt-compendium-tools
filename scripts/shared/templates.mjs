import constants from './constants.mjs';
import { log } from './messages.mjs';

export async function registerPartial(name, path) {
  const compiled = await getTemplate(`${constants.templateRoot}/${path}`);
  Handlebars.registerPartial(name, compiled);
}
