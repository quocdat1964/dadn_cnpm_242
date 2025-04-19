<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Device;
use Illuminate\Support\Facades\Http;

class DeviceController extends Controller
{
    /**
     * Cập nhật trạng thái của thiết bị điều khiển dựa trên feed_key.
     * Yêu cầu JSON:
     * {
     *   "feed_key": "light",
     *   "value": "1"  // "1" nghĩa là bật, còn khác "1" nghĩa là tắt
     * }
     */
    // public function syncControl(Request $request)
    // {
    //     $validatedData = $request->validate([
    //         'feed_key' => 'required|string|in:light,pumper',
    //         'value' => 'required|string'
    //     ]);

    //     $feedKey = $validatedData['feed_key'];
    //     // Quy ước: nếu value = "1" => status "on", ngược lại "off"
    //     $newStatus = (trim($validatedData['value']) === "1") ? 'on' : 'off';

    //     // Đồng bộ bảng devices dựa trên trường feed_key (đã được seed sẵn)
    //     $device = Device::updateOrCreate(
    //         ['feed_key' => $feedKey],
    //         ['status' => $newStatus]
    //     );

    //     return response()->json([
    //         'success' => true,
    //         'message' => "Device '{$feedKey}' updated to status '{$newStatus}'.",
    //         'data' => $device,
    //     ], 200);
    // }

    public function toggle(Request $request)
    {
        $data = $request->validate([
            'feed_key' => 'required|string|in:led,pumper',
            'value' => 'required|integer|in:0,1',    // integer rule vẫn cho phép string "1"
        ]);

        $feedKey = $data['feed_key'];
        // ép kiểu cho chắc chắn là int
        $value = (int) $data['value'];

        // Gửi lệnh lên Adafruit IO như trước
        $adafruitResp = Http::withHeaders([
            'X-AIO-Key' => config('services.adafruit.key'),
            'Accept' => 'application/json',
        ])->post(
                "https://io.adafruit.com/api/v2/" . config('services.adafruit.username') .
                "/feeds/{$feedKey}/data",
                ['value' => $value]
            );

        // Không return on error—vẫn update DB bất kể Adafruit có throttle
        if (!$adafruitResp->successful()) {
            \Log::warning("Adafruit IO error: " . $adafruitResp->body());
        }

        // **Ep kieu $value** đảm bảo đúng on/off
        $device = Device::updateOrCreate(
            ['feed_key' => $feedKey],
            [
                'name' => ucfirst($feedKey),
                'status' => $value === 1 ? 'on' : 'off',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Feed '{$feedKey}' đã được gửi lệnh `{$value}` và cập nhật status thành '{$device->status}'.",
            'adafruit_data' => $adafruitResp->successful() ? $adafruitResp->json() : null,
            'device' => $device,
        ], 200);
    }


    /**
     * Tắt tất cả thiết bị đèn/fan/pumper trên Adafruit IO
     * GET /api/devices/turn-off-all
     */
    public function turnOffAll()
    {
        $username = env('ADAFRUIT_IO_USERNAME');
        $aioKey = env('ADAFRUIT_IO_KEY');
        $feeds = ['led', 'pumper'];
        $results = [];

        foreach ($feeds as $feedKey) {
            $res = Http::withHeaders(['X-AIO-Key' => $aioKey])
                ->post("https://io.adafruit.com/api/v2/{$username}/feeds/{$feedKey}/data", [
                    'value' => 0
                ]);
            $results[$feedKey] = $res->successful() ? 'off' : 'error';
        }

        return response()->json([
            'success' => true,
            'results' => $results
        ], 200);
    }

    /**
     * POST  /api/devices/turn-on-all
     * Bật đồng thời tất cả các feed ('led', 'pumper') trên Adafruit IO.
     */
    public function turnOnAll()
    {
        $username = env('ADAFRUIT_IO_USERNAME');
        $aioKey = env('ADAFRUIT_IO_KEY');
        $feeds = ['led', 'pumper'];
        $results = [];

        foreach ($feeds as $feedKey) {
            $res = Http::withHeaders([
                'X-AIO-Key' => $aioKey,
                'Accept' => 'application/json',
            ])->post("https://io.adafruit.com/api/v2/{$username}/feeds/{$feedKey}/data", [
                        'value' => 1
                    ]);

            $results[$feedKey] = $res->successful() ? 'on' : 'error';
        }

        return response()->json([
            'success' => true,
            'results' => $results,
        ], 200);
    }

    /**
     * GET /api/devices/sync-status?feed_key={feed_key}
     *
     * 1. Lấy value mới nhất từ Adafruit IO
     * 2. Gọi tiếp /devices/control để đồng bộ local + gửi lệnh
     * 3. Trả về kết quả của cả hai
     */
    /**
     * GET /api/devices/status?feed_key={feed_key}
     * Trả về status (on/off) của device tương ứng feed_key
     */
    public function getStatus(Request $request)
    {
        $feedKey = $request->query('feed_key');
        if (!$feedKey) {
            return response()->json([
                'success' => false,
                'error' => 'feed_key is required',
            ], 400);
        }

        $device = Device::where('feed_key', $feedKey)->first();
        if (!$device) {
            return response()->json([
                'success' => false,
                'error' => "No device found for feed_key '{$feedKey}'",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'feed_key' => $feedKey,
            'status' => $device->status,   // hoặc $device->is_on ? 'on' : 'off'
            'device' => $device,           // tuỳ muốn gửi thêm thông tin thiết bị
        ], 200);
    }
    // Giả sử bạn vẫn có phương thức updateStatus cũ nếu cần, hoặc giữ lại một endpoint khác.

    // public function turnOffAll()
    // {
    //     $username = env('ADAFRUIT_IO_USERNAME');
    //     $aioKey = env('ADAFRUIT_IO_KEY');

    //     // Danh sách các feed của thiết bị cần tắt
    //     $feeds = ['led', 'fan', 'pumper'];

    //     $results = [];

    //     foreach ($feeds as $feedKey) {
    //         // Gửi request tắt (value = 0) lên Adafruit IO
    //         $response = Http::withHeaders([
    //             'X-AIO-Key' => $aioKey,
    //         ])->post("https://io.adafruit.com/api/v2/{$username}/feeds/{$feedKey}/data", [
    //                     'value' => 0
    //                 ]);

    //         $results[$feedKey] = $response->successful()
    //             ? 'off'
    //             : 'error';
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Turned off all devices.',
    //         'results' => $results
    //     ], 200);
    // }
}
