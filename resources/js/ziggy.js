const Ziggy = {"url":"https:\/\/ads.test","port":null,"defaults":{},"routes":{"login":{"uri":"login","methods":["GET","HEAD"]},"dashboard.index":{"uri":"\/","methods":["GET","HEAD"]},"dashboard.campaigns":{"uri":"campaigns","methods":["GET","HEAD"]},"dashboard.campaigns.adSets":{"uri":"campaigns\/adsets","methods":["GET","HEAD"]},"dashboard.campaigns.ads":{"uri":"campaigns\/ads","methods":["GET","HEAD"]},"campaigns.status.update":{"uri":"campaigns\/status","methods":["PATCH"]},"adSets.status.update":{"uri":"adsets\/status","methods":["PATCH"]},"ads.status.update":{"uri":"ads\/status","methods":["PATCH"]},"logout":{"uri":"logout","methods":["POST"]},"storage.local":{"uri":"storage\/{path}","methods":["GET","HEAD"],"wheres":{"path":".*"},"parameters":["path"]}}};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
  Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
