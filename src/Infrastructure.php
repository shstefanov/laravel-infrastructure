<?php namespace SHStefanov\Infrastructure;

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Route as Route;
use Illuminate\Support\Facades\Input as Input;
use App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

$infrastructure_app_name = "";

class Infrastructure extends Facade 
{

  protected static function getFacadeAccessor() { return 'Infrastructure'; }


  public static function assets() {
    $name = self::$app_name;
    return "<link rel='stylesheet' href='/dist/css/".$name.".bundle.css'>\n".
    "<script src='/dist/js/".$name.".bundle.js'></script>";
  }

  public static $app_name = "";
  public static function build($route, $options){
    


    if(isset($options["controllers"])){
      
      Route::get($route."/_index", function() use ($options){
        $result = [];
        $base_methods = array_merge(["__construct"], get_class_methods('App\Http\Controllers\Controller'));
        foreach($options["controllers"] as $controllerName){
          $result[$controllerName] = array_values(array_diff(get_class_methods('App\Http\Controllers\\'.$controllerName), $base_methods));
        }
        return $result;
      });

      Route::post($route."/_api", function(Request $request, Response $response) use ($options){
        $data = $request->all();
        $app = app();
        $body = json_decode($data["body"], true);
        $controller = $app->make('App\Http\Controllers\\'.$data["controller"]);
        return $controller->callAction($data["action"], $body);
      });

    }


    Route::get($route."/{a?}/{b?}/{c?}/{d?}/{e?}/{f?}/{g?}/{h?}/{i?}/{j?}", function() use ($options, $route){
      self::$app_name = $route;
      return view($options["view"]);
    });
  }

}
