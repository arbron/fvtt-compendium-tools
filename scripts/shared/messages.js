import constants from './constants.js';

export class GCError extends Error {
  constructor(error) {
    super(formatMessage(error));
  }
};

export function log(message) {
  console.log(formatMessage(message));
};

function formatMessage(message) {
  return `${constants.moduleLabel} | ${message}`;
};
