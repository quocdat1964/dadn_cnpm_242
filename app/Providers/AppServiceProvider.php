<?php
// app/Providers/AppServiceProvider.php

namespace App\Providers;

use App\Services\AdafruitService;
use Illuminate\Support\ServiceProvider;
use App\Services\AdafruitIoService;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Bind AdafruitIoService làm singleton
        $this->app->singleton(AdafruitService::class, function ($app) {
            return new AdafruitService();
        });
        
        $this->app->singleton(\App\Repositories\RecordRepository::class, function ($app) {
            return new \App\Repositories\RecordRepository();
        });
    }

    public function boot()
    {
        //
    }
}
