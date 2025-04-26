<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TelegramController extends Controller
{
    public function handle(Request $req)
    {
        // 1. Lấy text và chat_id từ payload JSON Telegram gửi lên
        $text = $req->input('message.text', '');
        $chatId = $req->input('message.chat.id');

        // 2. Phân tích lệnh, ví dụ: "/turn_on light1"
        if (preg_match('/^\/turn_on\s+(\w+)/', trim($text), $m)) {
            $deviceKey = $m[1];

            // Gọi phương thức trong DeviceController để bật thiết bị
            app(\App\Http\Controllers\DeviceController::class)
                ->toggleFromTelegram($deviceKey, $chatId, true);
        }

        // Telegram yêu cầu phải return HTTP 200 để biết bạn đã nhận thành công
        return response('OK', 200);
    }
}
