const Ziggy = {"url":"https:\/\/ads.test","port":null,"defaults":{},"routes":{"login":{"uri":"login","methods":["GET","HEAD"]},"dashboard.index":{"uri":"\/","methods":["GET","HEAD"]},"dashboard.campaigns":{"uri":"campaigns","methods":["GET","HEAD"]},"dashboard.campaigns.adSets":{"uri":"campaigns\/adsets","methods":["GET","HEAD"]},"dashboard.campaigns.ads":{"uri":"campaigns\/ads","methods":["GET","HEAD"]},"campaigns.status.update":{"uri":"campaigns\/{id}\/status","methods":["PATCH"],"parameters":["id"]},"adSets.status.update":{"uri":"adsets\/{id}\/status","methods":["PATCH"],"parameters":["id"]},"ads.status.update":{"uri":"ads\/{id}\/status","methods":["PATCH"],"parameters":["id"]},"logout":{"uri":"logout","methods":["POST"]},"storage.local":{"uri":"storage\/{path}","methods":["GET","HEAD"],"wheres":{"path":".*"},"parameters":["path"]}}};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
  Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
