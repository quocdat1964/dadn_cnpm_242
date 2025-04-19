<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdafruitController;
use App\Http\Controllers\SensorController;


Route::get('/', function () {
    return view('welcome');
});


