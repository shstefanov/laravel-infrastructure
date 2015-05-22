var fs                = require("fs");
var path              = require("path");
var webpack           = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var YAML              = require('yamljs');

require.extensions['.yml'] = function(module, filename) {
  var yaml_string = fs.readFileSync(filename, 'utf8').toString();
  module.exports = YAML.parse(yaml_string);
};

var bulk              = require('bulk-require');


var assetsPathPattern = "public/dist/{destination}/[hash].[ext]";
var assetsOptions     = "url?limit=1&name="+assetsPathPattern+"&minetype=image/{ext}";
var libPath           = path.join(process.cwd(), "vendor/shstefanov/infrastructure/src/js/lib");
var buildDest         = "./public/dist/";


var systemAliases = {
  "App":             path.join( libPath, "classes.js"       ),
  "helpers":         path.join( libPath, "helpers.js"       ),
  "config":          path.join( libPath, "config.js"        ),
  "app":             path.join( libPath, "app.js"           ),
  "api":             path.join( libPath, "api.js"           ),
  "controllers":     path.join( libPath, "controllers.js"   ),
  // "styles":          path.join( libPath, "load_styles.js"   ),
  // "resources":  path.join(process.cwd(), "frontend/resources/resources.js"),
  // "data":       path.join(process.cwd(), "frontend/data/index.js"),
  // "templates":  path.join(process.cwd(), "frontend/instances/templates.js"),
}

var helpers = require(systemAliases.helpers);

var main_config = bulk(path.join(process.cwd(), "config", "infrastructure"), ['**/*.js','**/*.json', '**/*.yml']);
if(main_config.development){
  helpers.deepExtend(main_config, main_config.development);
  delete main_config.development;
}
main_config = JSON.stringify(main_config);


var packer = function(name, app_path){
  var entry_poynt     = path.join(app_path, "index.js");
  if(!fs.existsSync(entry_poynt)) return console.log("No index.js file in "+ app_path);
  var app_config_path = path.join(app_path, "webpack.config.js");
  var app_config;
  if(!fs.existsSync(app_config_path)) app_config = {};
  else                                app_config = require(app_config_path);
  build(name, {
    entry:        create_entry(name, app_path),
    app_config:   load_config(name, app_path)
  });
}

function load_config(name, app_path){
  var global_config = JSON.parse(main_config);
  var app_config = bulk(path.join(app_path, "config"), ['**/*.js','**/*.json', '**/*.yml']);
  if(app_config.development){
    helpers.deepExtend(app_config, app_config.development);
    delete app_config.development;
  }
  app_config.infrastructure = { name: name };
  helpers.deepExtend(global_config, app_config);
  return JSON.stringify(app_config);
}

var _ = require("underscore");
function create_entry(name, app_path){
  var entry           = {};
  entry[name]         = path.join(app_path, "index.js");
  var testsPath       = path.join(app_path, "tests", "index.js");
  if(fs.existsSync(testsPath)){
    entry[name+".test"] = path.join(app_path, "tests", "index.js");
  }
  return entry;
}

function build(name, config){

  var webpack_config = {
    // context:  "./", // The root folder, default - process.cwd()
    watch: config.watch || false,

    entry: config.entry,

    output: {
      filename:   buildDest + "js/[name].bundle.js",
      publicPath: '/',
    },

    resolve: {
      alias: _.extend(config.alias || {}, systemAliases )
    },

    module:{

      loaders: [

        { test: /backbone.js$/,              loader:"imports?define=>false&_=>require('underscore')" },
        { test: /ractive.runtime.js$/,       loader:"imports?parse=>function(){}"          },

        { test: /\.json$/,                   loader: "json"                                },
        { test: /\.yml$/,                    loader: "json!yaml"                           },
        { test: /\.txt$/,                    loader: "raw"                                 },
        { test: /\.html$/,                   loader: "transform?html-minifyify!ractive"    },
        { test: /\.js$/,                     loader: "transform?bulkify"                   },
        { test: /\.js$/,                     loader: "source-map"                          },
        { test: /\.coffee$/,                 loader: "source-map!coffee-loader"            },

        { test: /\.less$/,                   loader: ExtractTextPlugin.extract("style-loader", "css-loader?sourceMap!autoprefixer!less-loader"   )},
        { test: /\.scss$/,                   loader: ExtractTextPlugin.extract("style-loader", "css-loader?sourceMap!autoprefixer!sass-loader"   )},
        { test: /\.css$/,                    loader: ExtractTextPlugin.extract("style-loader", "css-loader?sourceMap!autoprefixer"               )},

        { test: /\.gif/i,                    loader: assetsOptions.replace("{destination}", "images").replace("{ext}","gif" )  },
        { test: /\.jpe?g/i,                  loader: assetsOptions.replace("{destination}", "images").replace("{ext}","jpg" )  },
        { test: /\.png/i,                    loader: assetsOptions.replace("{destination}", "images").replace("{ext}","png" )  },
        { test: /\.svg/i,                    loader: assetsOptions.replace("{destination}", "images").replace("{ext}","svg" )  },

        { test: /\.woff/i,                   loader: assetsOptions.replace("{destination}", "fonts") .replace("{ext}","woff")  },
        { test: /\.eot/i,                    loader: assetsOptions.replace("{destination}", "fonts") .replace("{ext}","eot" )  },
        { test: /\.ttf/i,                    loader: assetsOptions.replace("{destination}", "fonts") .replace("{ext}","ttf" )  },

      ].concat(config.loaders || [])
    },

    plugins: [

      new webpack.DefinePlugin({APP_CONFIG: config.app_config}),

      new ExtractTextPlugin("./public/dist/css/"+name+".bundle.css", {
        allChunks: true
      })

    ].concat(config.plugins || [])
  };

  var lastHash;
  var compiler = webpack(webpack_config, function(err, stats) {
    if(!webpack_config.watch) {
      // Do not keep cache anymore
      compiler.purgeInputFileSystem();
    }
    if(err) {
      lastHash = null;
      console.error(err.stack || err);
      if(err.details) console.error(err.details);
      if(!webpack_config.watch) {
        process.on("exit", function() {
          process.exit(1);
        });
      }
      return;
    }
    if(stats.hash !== lastHash) {
      lastHash = stats.hash;
      process.stdout.write(stats.toString(outputOptions) + "\n");
    }
  });


  
}

var outputOptions = {
  cached:        false,
  cachedAssets:  false,
  // context:       options.context,
  colors:        require("supports-color"),
  chunks:        true,
  modules:       true,
  chunkModules:  true,
  reasons:       true,
  cached:        true,
  cachedAssets:  true 
};



var appsPath  = path.join(process.cwd(), "app/SinglePage");
var apps      = fs.readdirSync(appsPath);
if(apps.length === 0){
  return console.log("No apps found in ./app/SinglePage");
}

apps.forEach(function(folderName){
  var app_path = path.join(appsPath, folderName);
  packer(folderName, app_path);
});






