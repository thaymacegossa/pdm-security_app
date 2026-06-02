/** Log apenas em desenvolvimento — usado para rastrear fluxo coercivo mockado */
export function devLog(...args: unknown[]) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.info(...args);
  }
}
