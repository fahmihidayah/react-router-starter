/**
 * Create a slug from text
 * Converts text to lowercase and replaces spaces with dashes
 * @param text - The text to convert to slug
 * @returns The slug formatted string
 */
export function createSlugFrom(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
