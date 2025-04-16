<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('devices')->insert([
            [
                'name' => 'Light',
                'feed_key' => 'light',
                'status' => 'off', // mặc định tắt
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pumper',
                'feed_key' => 'pumper',
                'status' => 'off',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
