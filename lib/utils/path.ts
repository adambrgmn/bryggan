export function join(...parts: string[]) {
  let cleanParts: string[] = [];
  let first = true;
  for (let part of parts) {
    if (first && part !== '/') {
      cleanParts.push(part.replace(/\/$/, ''));
    } else {
      cleanParts.push(part.replace(/^\//, '').replace(/\/$/, ''));
    }

    first = false;
  }

  return cleanParts.join('/');
}
