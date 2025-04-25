<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class UserController extends Controller
{   
    
    public function profile()
    {
        return response()->json(auth()->user());
    }

    public function updateProfile(Request $request)
    {
    $user = Auth::user();

    $validated = $request->validate([
        'name' => 'nullable|string',
        'gender' => 'nullable|string',
        //'phone' => 'nullable|string',
        //'avatar' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        // bạn có thể thêm các field khác nếu muốn
    ]);

    // Xử lý ảnh nếu có
    if ($request->hasFile('avatar')) {
        $path = $request->file('avatar')->store('avatars', 'public');
        $validated['avatar'] = $path;
    }

    $user->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Cập nhật thông tin thành công',
        'user' => $user,
    ]);
}
}
