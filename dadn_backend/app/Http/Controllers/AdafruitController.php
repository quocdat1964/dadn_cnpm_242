<?php
// app/Http/Controllers/AdafruitController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AdafruitService;

class AdafruitController extends Controller
{
    protected $adafruitService;

    public function __construct(AdafruitService $adafruitService)
    {
        $this->adafruitService = $adafruitService;
    }
    /**
     * GET /api/sensors/adafruit/latest?feed_key={feed_key}
     */
    public function getFeedData(Request $request)
    {
        $feedKey = $request->query('feed_key');
        if (!$feedKey) {
            return response()->json(['success' => false, 'error' => 'feed_key is required'], 400);
        }

        // 2) Gọi service để lấy data (vẫn có thể trả về nhiều record)
        $all = $this->adafruitService->getFeedData($feedKey);

        // 3) Lấy phần tử đầu tiên (nếu có)
        $latest = $all[0] ?? null;

        if ($latest === null) {
            return response()->json([
                'success' => false,
                'error' => "Không có dữ liệu cho feed '{$feedKey}'",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'feed_key' => $feedKey,
            'data' => $latest,      // chỉ trả về record mới nhất
        ], 200);
    }


}
