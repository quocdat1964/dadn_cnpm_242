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
    public function getFeedData($feed)
    {
        $data = $this->adafruitService->getFeedData($feed);
        if ($data === null) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy dữ liệu từ Adafruit IO'
            ], 500);
        }
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}
