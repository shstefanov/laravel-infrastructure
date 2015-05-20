<?php namespace SHStefanov\Infrastructure;

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Route as Route;


class Infrastructure extends Facade {
  
  protected static function getFacadeAccessor() { return 'Infrastructure'; }
  
  public static function say(){
    return 554;
  }

  public static function build($route, $options){
    Route::get($options["route"]."/api", function(){
      dd("AAAAAA -------");
    });
  }

}
