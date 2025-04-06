<?php

namespace App\Console\Commands;


use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Sensor;
use App\Models\Record;
use Carbon\Carbon;

class SyncSensorData extends Command
{
    protected $signature = 'sync:sensors';
    protected $description = 'Lấy dữ liệu từ Adafruit IO về và lưu vào bảng records';

    public function handle()
    {
        $this->info("Cronjob đang chạy lúc " . now());
        $username = env('ADAFRUIT_IO_USERNAME');
        $aioKey = env('ADAFRUIT_IO_KEY');

        $sensors = Sensor::all();

        foreach ($sensors as $sensor) {
            $url = "https://io.adafruit.com/api/v2/{$username}/feeds/{$sensor->feed_key}/data?limit=1";

            $response = Http::withHeaders([
                'X-AIO-Key' => $aioKey
            ])->get($url);

            if ($response->successful()) {
                $data = $response->json()[0] ?? null;

                if ($data) {
                    $value = (float) $data['value'];
                    // $recordedAt = Carbon::parse($data['created_at']);
                    $recordedAt = Carbon::parse($data['created_at'])->timezone('Asia/Ho_Chi_Minh');
                    // Kiểm tra đã có bản ghi chưa
                    $exists = Record::where('sensor_id', $sensor->id)
                        ->where('recorded_at', $recordedAt)
                        ->exists();

                    if (!$exists) {
                        Record::create([
                            'sensor_id' => $sensor->id,
                            'value' => $value,
                            'recorded_at' => $recordedAt,
                        ]);

                        $this->info("Đã lưu '{$sensor->name}': {$value} lúc {$recordedAt}");
                    } else {
                        $this->line("Đã tồn tại dữ liệu '{$sensor->name}' tại {$recordedAt}");
                    }
                }
            } else {
                $this->error("Không thể lấy feed '{$sensor->feed_key}' từ Adafruit.");
            }
        }
    }
}
