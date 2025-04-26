<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Carbon\Carbon;



class ActivityLogController extends Controller
{
    public function index()
    {
        // $logs = ActivityLog::orderBy('created_at', 'desc')->get();
        // Lấy tất cả các bản ghi trong 30 ngày qua
        $logs = ActivityLog::where('created_at', '>=', Carbon::now()->subDays(30))
                       ->orderBy('created_at', 'desc')
                       ->get();


        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
