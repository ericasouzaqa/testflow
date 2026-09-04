export function substituteVariables(
  template: string,
  variables: Record<string, string>
): string {
  if (!template) return template;
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(variables, key)
      ? variables[key]
      : match;
  });
}

export function substituteInHeaders(
  headers: Record<string, string>,
  variables: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    result[substituteVariables(key, variables)] = substituteVariables(
      value,
      variables
    );
  }
  return result;
}

/** Le um valor aninhado de um objeto usando um caminho "a.b.c" */
export function getByPath(obj: any, path: string): any {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}
