const core = require('@lumjs/core');

exports.Model = require('./model');
exports.Extension = require('./extension');

core.lazy(exports, 'enableWS', () => require('./ws-data'), core.def.e);
