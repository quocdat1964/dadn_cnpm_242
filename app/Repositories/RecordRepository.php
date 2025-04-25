<?php
// app/Repositories/RecordRepository.php
namespace App\Repositories;

use App\Models\Record;
use Carbon\Carbon;

class RecordRepository
{
    public function upsert(string $feedKey, float $value, ?Carbon $timestamp = null): void
    {
        $timestamp = $timestamp ?: Carbon::now('Asia/Ho_Chi_Minh');
        $sensor = \App\Models\Sensor::where('feed_key', $feedKey)->firstOrFail();

        Record::updateOrCreate(
            [
                'sensor_id' => $sensor->id,
                'recorded_at' => $timestamp
            ],
            ['value' => $value]
        );
    }

    public function getLatest(string $feedKey): ?float
    {
        $sensor = \App\Models\Sensor::where('feed_key', $feedKey)->firstOrFail();
        $rec = Record::where('sensor_id', $sensor->id)
            ->orderBy('recorded_at', 'desc')
            ->first();
        return $rec ? $rec->value : null;
    }
}
