const { contextBridge } = require('electron');
const Store = require('electron-store');

const store = new Store({ name: 'codes-data' });

contextBridge.exposeInMainWorld('api', {
  getCodes: () => store.get('codes', []),
  saveCodes: (codes) => store.set('codes', codes)
});
