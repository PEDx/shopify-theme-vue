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
  username: string;
  password: string;
  store: string;
  target: string;
}

/**
 * Upload Asset
 *
 * Uploads a single asset
 */
export async function upload(asset: string, config: { theme: Theme; key: FileKeys }): Promise<boolean> {
  const url = `https://admin.shopify.com/store/${config.theme.store}/themes/${config.theme.target}/assets.json`;
  console.log(url);
  const request = {
    method: 'put',
    url,
    data: {
      asset: {
        key: config.key,
        value: asset,
      },
    },
  };

  return fetch(request.url, {
    method: request.method,
    body: JSON.stringify(request.data),
    headers: {
      Authorization:
        'Basic ' +
        btoa(
          (config.theme.username || '') +
            ':' +
            (config.theme.password ? unescape(encodeURIComponent(config.theme.password)) : ''),
        ),
    },
  })
    .then((res) => {
      console.log(res);
      return true;
    })
    .catch((e) => {
      console.error(config.key);
      console.error(e);
      return false;
    });
}
