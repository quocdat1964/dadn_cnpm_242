<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use App\Models\User;

class PasswordResetController extends Controller
{
    // Gửi email đặt lại mật khẩu
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại.'], 404);
        }

        // Tạo token và lưu vào bảng password_resets
        $token = Str::random(60);
        DB::table('password_resets')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => Carbon::now(),
            ]
        );

        // Gửi mail chứa link reset
        $url = url("/reset-password?token=$token&email=" . urlencode($user->email));

        Mail::send('emails.reset_password', ['user' => $user, 'url' => $url], function ($message) use ($user) {
            $message->from('tomatosmartfarmBK@gmail.com', 'Smart Tomato Farm');
            $message->to($user->email);
            $message->subject('Đặt lại mật khẩu');
        });

        return response()->json(['message' => 'Đã gửi hướng dẫn đặt lại mật khẩu.']);
    }

    // Thực hiện reset mật khẩu
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:6',
        ]);

        $record = DB::table('password_resets')->where('email', $request->email)->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token không hợp lệ hoặc hết hạn.'], 400);
        }

        // Reset password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Xóa token sau khi dùng
        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Đổi mật khẩu thành công!']);
    }
}
