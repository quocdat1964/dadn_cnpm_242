<?php
// app/Services/AdafruitIoService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AdafruitService
{
    protected string $username;
    protected string $key;

    public function __construct()
    {
        $this->username = config('services.adafruit.username');
        $this->key = config('services.adafruit.key');
    }

    /**
     * Lấy giá trị cuối cùng từ Adafruit IO.
     */
    public function fetchLastValue(string $feedKey): float
    {
        $url = "https://io.adafruit.com/api/v2/{$this->username}/feeds/{$feedKey}/data?limit=1";

        $resp = Http::withHeaders([
            'X-AIO-Key' => $this->key,
        ])->get($url);

        if (!$resp->successful()) {
            throw new \RuntimeException("Cannot fetch data from Adafruit IO ({$feedKey}).");
        }

        $json = $resp->json();
        return isset($json[0]['value'])
            ? (float) $json[0]['value']
            : 0.0;
    }

    /**
     * Gửi một giá trị mới lên feed.
     */
    public function publishValue(string $feedKey, int $value): bool
    {
        $url = "https://io.adafruit.com/api/v2/{$this->username}/feeds/{$feedKey}/data";
        $resp = Http::withHeaders([
            'X-AIO-Key' => $this->key,
            'Accept' => 'application/json',
        ])->post($url, ['value' => $value]);
        return $resp->successful();
    }
}
