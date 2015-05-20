<?php namespace SHStefanov\Infrastructure;
 
use Illuminate\Support\ServiceProvider;
 
class InfrastructureServiceProvider extends ServiceProvider {


  protected $commands = [
    'SHStefanov\Infrastructure\Commands\SetupInfrastructure'
  ];



  public function boot(){
    $this->publishes([__DIR__.'/config/infrastructure.php' => config_path('infrastructure.php')]);
  }

  public function register(){
    include __DIR__.'/routes.php';
    $this->app->make('SHStefanov\Infrastructure\InfrastructureController');
    $this->commands($this->commands);
  }
 
}
