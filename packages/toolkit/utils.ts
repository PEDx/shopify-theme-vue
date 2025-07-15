export function random_string(e: number) {
  e = e || 32;
  var t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',
    a = t.length,
    n = '';
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
}

export function get_app_id(isDev = false) {
  if (isDev) {
    return `vue-liquid-app-dev-{{ section.id }}`;
  }

  return `vue-liquid-app-${random_string(10)}`;
}

export const get_comment = (comment: string) => {
  return `/**
${comment}
*/\n`;
};

export const get_liquid_comment = (comment: string) => {
  return `{% comment %}
${comment}
{% endcomment %}\n`;
};

export const generate_build_banner = () => {
  return `*  build date ${new Date().toLocaleString()}`;
};

export const get_app_root_tag = (appid: string, html: string) => {
  return `<div id="${appid}" data-server-rendered="true">${html}</div>`;
};

export const generate_code_preview_liquid = ({
  html,
  script,
  style,
  appid,
}: {
  html: string;
  script?: string;
  style?: string;
  appid: string;
}) => {
  return `
    <style>${style}</style>
    ${get_app_root_tag(appid, html)}
    <script type="text/javascript">${script}</script>
`;
};

export const generate_release_liquid = ({
  html,
  appid,
  script_name,
  style_name,
  schema,
}: {
  html: string;
  appid: string;
  script_name: string;
  style_name: string;
  schema?: string;
}) => {
  let liquid = `<link href="{{ "${style_name}" | asset_url }}" rel="stylesheet" type="text/css" >
${get_app_root_tag(appid, html)}
<script src="{{ "${script_name}" | asset_url }}" type="text/javascript" defer fetchpriority="high"></script>`;

  if (schema) liquid += `{% schema %} ${schema} {% endschema %}`;

  return liquid;
};

export const generate_dev_liquid = ({
  html,
  appid,
  script_url,
  schema,
}: {
  html: string;
  appid: string;
  script_url: string;
  schema?: string;
}) => {
  let liquid = `${get_app_root_tag(appid, html)}
<script type="module" src="${script_url}"></script>`;

  if (schema) liquid += `\n{% schema %} ${schema} {% endschema %}`;

  return liquid;
};
