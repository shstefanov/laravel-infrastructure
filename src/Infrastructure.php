<?php namespace SHStefanov\Infrastructure;

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Route as Route;
use Illuminate\Support\Facades\Input as Input;
use App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;


class Infrastructure extends Facade {
  
  protected static function getFacadeAccessor() { return 'Infrastructure'; }

  // private static $cache = [];
  // public static function set($key, $val){ $this->cache[$key] = $val; }
  // public static function get($key)      { return $this->cache[$key]; }

  public static function build($route, $options){



    if(isset($options["controllers"])){
      
      Route::get($options["route"]."/_index", function() use ($options){
        $result = [];
        $base_methods = array_merge(["__construct"], get_class_methods('App\Http\Controllers\Controller'));
        foreach($options["controllers"] as $controllerName){
          $result[$controllerName] = array_values(array_diff(get_class_methods('App\Http\Controllers\\'.$controllerName), $base_methods));
        }
        return $result;
      });

      Route::get($options["route"]."/_api", function(Request $request, Response $response) use ($options){
        $data = $request->all();
        $app = app();
        $controller = $app->make('App\Http\Controllers\\'.$data["controller"]);
        return $controller->callAction($data["action"], [$data["body"]]);
      });

    }


    Route::get($options["route"]."/{a?}/{b?}/{c?}/{d?}/{e?}/{f?}/{g?}/{h?}/{i?}/{j?}", function() use ($options){
      return view($options["view"]);
    });
  }

}
