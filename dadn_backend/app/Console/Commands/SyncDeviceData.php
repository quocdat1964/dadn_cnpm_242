<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Device;
use Carbon\Carbon;

class SyncDeviceData extends Command
{
    /**
     * The name and signature of the console command.
     * Chạy: php artisan sync:devices
     */
    protected $signature = 'sync:devices';

    /**
     * The console command description.
     */
    protected $description = 'Lấy dữ liệu từ Adafruit IO và cập nhật trạng thái của các thiết bị điều khiển ("light" và "pumper") dựa trên last_value';

    public function handle()
    {
        $this->info("Syncing device feed data at " . now());

        // Lấy thông tin tài khoản Adafruit IO từ file .env
        $username = env('ADAFRUIT_IO_USERNAME');
        $aioKey = env('ADAFRUIT_IO_KEY');

        // Lấy tất cả các device được seed trong bảng devices có feed_key là "light" hoặc "pumper"
        $devices = Device::whereIn('feed_key', ['light', 'pumper'])->get();

        foreach ($devices as $device) {
            $feedKey = $device->feed_key;
            // Xây dựng URL API để lấy thông tin feed từ Adafruit IO cho device này
            $url = "https://io.adafruit.com/api/v2/{$username}/feeds/{$feedKey}/data?limit=1";
            $this->info("Fetching feed details for '{$feedKey}' from: " . $url);

            $response = Http::withHeaders([
                'X-AIO-Key' => $aioKey,
            ])->get($url);

            if ($response->successful()) {
                $data = $response->json()[0] ?? null; // Lấy phần tử đầu tiên của mảng dữ liệu
                if (!$data) {
                    $this->line("No data received for feed '{$feedKey}'.");
                    continue;
                }

                // Xác định trạng thái dựa trên trường 'last_value'
                // Quy ước: nếu last_value = "1" thì status là "on", ngược lại là "off"
                $data = $response->json()[0] ?? null;
                if ($data) {
                    // Sử dụng 'value' thay vì 'last_value'
                    $recordValue = isset($data['value']) ? trim($data['value']) : null;
                    $newStatus = ($recordValue === "1") ? 'on' : 'off';
                    // ...
                }

                // Tạo mảng dữ liệu để đồng bộ cho device.
                $deviceData = [
                    'name' => $data['name'] ?? $feedKey,
                    'feed_key' => $data['key'] ?? $feedKey,
                    'status' => $newStatus,
                ];

                // Đồng bộ vào bảng devices dựa trên trường feed_key
                $updatedDevice = Device::updateOrCreate(
                    ['feed_key' => $deviceData['feed_key']],
                    $deviceData
                );

                // Cập nhật timestamps nếu có trong dữ liệu từ Adafruit IO
                if (isset($data['created_at'])) {
                    $updatedDevice->created_at = Carbon::parse($data['created_at']);
                }
                if (isset($data['updated_at'])) {
                    $updatedDevice->updated_at = Carbon::parse($data['updated_at']);
                }
                $updatedDevice->save();

                $this->info("Synchronized device: ID {$updatedDevice->id} | Name: '{$updatedDevice->name}' | Feed Key: '{$updatedDevice->feed_key}' | Status: '{$updatedDevice->status}'.");
            } else {
                $this->error("Failed to retrieve feed details for '{$feedKey}'. Response: " . $response->body());
            }
        }

        return 0;
    }
}
