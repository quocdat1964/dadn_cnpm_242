<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sensor;
use App\Models\Record;
use Carbon\Carbon;

use App\Events\NewSensorData; // Import event

class SensorController extends Controller
{
    public function storeData(Request $request)
    {
        $feedKey = $request->input('feed_id');
        $value = $request->input('value');

        // Tìm sensor theo feed_key
        $sensor = Sensor::where('feed_key', $feedKey)->first();

        if (!$sensor) {
            // Nếu không tìm thấy sensor, trả về lỗi
            return response()->json([
                'success' => false,
                'error' => "Sensor with feed_key '$feedKey' not found",
            ], 404);
        }

        // Tạo record mới với sensor_id, value và thời gian hiện tại
        $record = Record::create([
            'sensor_id' => $sensor->id,
            'value' => floatval($value),
            'recorded_at' => Carbon::now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data stored successfully',
            'data' => $record
        ], 200);
    }

    public function getCurrentReadings(Request $request)
    {
        // Lấy tất cả cảm biến từ bảng sensors
        $sensors = Sensor::all();
        $result = [];

        foreach ($sensors as $sensor) {
            // Lấy bản ghi mới nhất (dựa theo recorded_at) từ bảng records cho từng sensor
            $record = Record::where('sensor_id', $sensor->id)
                ->orderBy('recorded_at', 'desc')
                ->first();

            $result[] = [
                'sensor_id' => $sensor->id,
                'sensor_name' => $sensor->name,
                'feed_key' => $sensor->feed_key,
                'reading' => $record ? $record->value : null,
                'recorded_at' => $record ? $record->recorded_at : null,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ], 200);
    }





}
