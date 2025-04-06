<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SensorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sensors')->insert([
            [
                'name' => 'Light',
                'feed_key' => 'light',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Soil Moisturer',
                'feed_key' => 'soil-moisturer',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Air Humidity',
                'feed_key' => 'air-humidity',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Temperature',
                'feed_key' => 'temperature',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
