let constants = {
  moduleName: 'compendium-tools',
  moduleLabel: 'Arbron\'s Compendium Tools',

  replaceEntryWidth: 400,
  replaceEntryHeight: 300,

  _updateModuleFeatures: false,
};
constants.modulePath = `modules/${constants.moduleName}`;
constants.socket = `module.${constants.moduleName}`;
constants.templateRoot = `${constants.modulePath}/templates`;

export default constants;
