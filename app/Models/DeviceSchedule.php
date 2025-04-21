<?php

// app/Models/DeviceSchedule.php
namespace App\Models;
use Carbon\Carbon;
use DateTimeInterface;
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

    /**
     * Override serializeDate để format ngày theo Asia/Ho_Chi_Minh
     */
    protected function serializeDate(DateTimeInterface $date)
    {
        // ép về Carbon để gọi setTimezone()
        return Carbon::instance($date)
            ->setTimezone('Asia/Ho_Chi_Minh')
            ->format('Y-m-d H:i:s');
    }
}
