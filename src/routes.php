<?php 

Route::get('infrastructure', 'SHStefanov\Infrastructure\InfrastructureController@home');
Route::get('infrastructure/access', 'SHStefanov\Infrastructure\InfrastructureController@getAccess');



