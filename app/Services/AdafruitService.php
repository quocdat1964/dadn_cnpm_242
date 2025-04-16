<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AdafruitService
{
    protected $username;
    protected $key;

    public function __construct()
    {
        // Lấy giá trị từ config (đã cấu hình trong config/services.php)
        $this->username = config('services.adafruit.username');
        $this->key = config('services.adafruit.key');
    }

    /**
     * Lấy dữ liệu của một feed từ Adafruit IO.
     *
     * @param string $feedKey Tên feed trên Adafruit IO
     * @param int|null $limit Số bản ghi muốn lấy (mặc định 10)
     * @return array|null
     */
    public function getFeedData(string $feedKey, ?int $limit = 10): ?array
    {
        $endpoint = "https://io.adafruit.com/api/v2/{$this->username}/feeds/{$feedKey}/data";
        $params = ['limit' => $limit];

        $response = Http::withHeaders([
            'X-AIO-Key' => $this->key,
        ])->get($endpoint, $params);

        if ($response->successful()) {
            return $response->json();
        }
        return null;
    }
}
