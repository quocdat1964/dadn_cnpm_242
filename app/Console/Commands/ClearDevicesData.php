<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearDevicesData extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'clear:devices';

    /**
     * The console command description.
     */
    protected $description = 'Xóa toàn bộ dữ liệu trong bảng devices';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        DB::table('devices')->truncate();
        $this->info('All data in the devices table has been cleared.');
        return 0;
    }
}
