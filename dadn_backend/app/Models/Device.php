<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Device extends Model
{
    use HasFactory;

    // Bao gồm feed_key, name, và status
    protected $fillable = ['feed_key', 'name', 'status'];
}
