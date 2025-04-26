<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdafruitController;
use App\Http\Controllers\SensorController;

use Pusher\Pusher;

Route::get('/pusher-test', function () {
    // Nạp Composer autoload
    require base_path('vendor/autoload.php');

    // Khởi tạo Pusher với credentials của bạn
    $options = [
        'cluster' => 'ap1',
        'useTLS' => true
    ];
    $pusher = new Pusher(
        '3d85d9cfe39bd5e170f3',  // app key
        '5867f2ed09115ae573cb',  // app secret
        '1978882',               // app id
        $options
    );

    // Trigger event
    $data = ['message' => 'hello world'];
    $pusher->trigger('my-channel', 'my-event', $data);

    return 'Pusher event sent';
});


Route::get('/', function () {
    return view('welcome');
});


