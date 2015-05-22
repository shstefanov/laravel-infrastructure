var config     = APP_CONFIG;
if(config.development){
  var helpers = require("helpers");
  helpers.deepExtend(config, config.development);
}
module.exports = config;

