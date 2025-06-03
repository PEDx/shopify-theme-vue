export function randomString(e: number) {
  e = e || 32;
  var t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',
    a = t.length,
    n = '';
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
}

export function getAppId(isDev = false) {
  if (isDev) {
    return 'vue-liquid-app-dev';
  }

  return `vue-liquid-app-${randomString(8)}`;
}
