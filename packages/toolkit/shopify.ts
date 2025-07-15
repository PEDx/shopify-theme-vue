import { ensureAuthenticatedThemes } from '@shopify/cli-kit/node/session';
import { bulkUploadThemeAssets } from '@shopify/cli-kit/node/themes/api';

type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

export type FileKeys = LiteralUnion<
  | `templates/${string}${'.liquid' | '.json'}`
  | `templates/customer/${string}${'.liquid' | '.json'}`
  | `assets/${string}`
  | `sections/${string}${'.liquid' | '-group.json'}`
  | `snippets/${string}${'.liquid'}`
  | `layout/${string}${'.liquid'}`
  | `locales/${string}${'.json'}`
  | `config/settings_${'data' | 'schema'}${'.json'}`,
  string
>;

export interface Theme {
  store: string;
  id: string;
}

export interface IUploadOptions {
  theme: Theme;
  files: {
    key: FileKeys;
    value: string;
  }[];
}

/**
 * Upload Asset
 *
 * Uploads a single asset
 */
export async function uploadShopifyFiles({ theme, files }: IUploadOptions): Promise<boolean> {
  console.log(theme);

  let start = performance.now();

  const adminSession = await ensureAuthenticatedThemes(theme.store, '');

  console.log('ensureAuthenticatedThemes latency:', performance.now() - start, 'ms');

  start = performance.now();

  const result = await bulkUploadThemeAssets(Number(theme.id), files, adminSession);

  console.log('bulkUploadThemeAssets latency:', Date.now() - start, 'ms');

  console.log(result);

  return result.length > 0;
}
