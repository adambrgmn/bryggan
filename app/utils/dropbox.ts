export function parsePageName(name: string): string {
  let match = name.match(/^(?<year>\d{4})-(?<issue>.+)-(?<page>\d{3})\.pdf$/);
  if (match == null) return name;
  if (typeof match.groups?.page === 'string') return match.groups.page;
  return name;
}
