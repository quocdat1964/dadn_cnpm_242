<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    protected $table = 'sensors';

    protected $fillable = [
        'name',
        'feed_key',
    ];

    public function records()
    {
        return $this->hasMany(Record::class);
    }

    // Nếu mỗi sensor chỉ có 1 thiết bị:
    public function device()
    {
        return $this->hasOne(Device::class);
    }
}
