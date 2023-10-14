export const registerHandlebarsHelpers = (): void => {
  Handlebars.registerHelper(
    'uppercase',
    (value?: string): string | undefined => value?.toUpperCase()
  );

  Handlebars.registerHelper('localizeCharacShort', (key?: string): string =>
    (game as Game).i18n.localize(`FS4.Characteristic.${key}.short`)
  );

  Handlebars.registerHelper('localizeCharacFull', (key?: string): string =>
    (game as Game).i18n.localize(`FS4.Characteristic.${key}.full`)
  );
};
