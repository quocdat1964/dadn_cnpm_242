<?php

// app/Models/DeviceSchedule.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceSchedule extends Model
{
    protected $fillable = [
        'feed_key',
        'start_at',
        'end_at',
        'enabled',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'enabled' => 'boolean',
    ];
}
