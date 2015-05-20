<?php namespace SHStefanov\Infrastructure;
use App\Http\Controllers\Controller;
use App\User;
class InfrastructureController extends Controller {

  public function home(){
    return response(['Infrastructure Status' => 'Welcome to Infrastructure package']);
  }

  public function getAccess(){
    return response(['Infrastructure Access' => 'Here will be access to single page apps backends']);
  }

}
