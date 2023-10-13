export const registerHandlebarsHelpers = (): void => {
  Handlebars.registerHelper(
    'uppercase',
    (value?: string): string | undefined => value?.toUpperCase()
  );
};
