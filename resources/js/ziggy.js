const Ziggy = {"url":"https:\/\/ads.test","port":null,"defaults":{},"routes":{"login":{"uri":"login","methods":["GET","HEAD"]},"dashboard.index":{"uri":"\/","methods":["GET","HEAD"]},"logout":{"uri":"logout","methods":["POST"]},"storage.local":{"uri":"storage\/{path}","methods":["GET","HEAD"],"wheres":{"path":".*"},"parameters":["path"]}}};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
  Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
