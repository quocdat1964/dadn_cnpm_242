<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Device;

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
    public function syncControl(Request $request)
    {
        $validatedData = $request->validate([
            'feed_key' => 'required|string|in:light,pumper',
            'value' => 'required|string'
        ]);

        $feedKey = $validatedData['feed_key'];
        // Quy ước: nếu value = "1" => status "on", ngược lại "off"
        $newStatus = (trim($validatedData['value']) === "1") ? 'on' : 'off';

        // Đồng bộ bảng devices dựa trên trường feed_key (đã được seed sẵn)
        $device = Device::updateOrCreate(
            ['feed_key' => $feedKey],
            ['status' => $newStatus]
        );

        return response()->json([
            'success' => true,
            'message' => "Device '{$feedKey}' updated to status '{$newStatus}'.",
            'data' => $device,
        ], 200);
    }

    // Giả sử bạn vẫn có phương thức updateStatus cũ nếu cần, hoặc giữ lại một endpoint khác.
}
