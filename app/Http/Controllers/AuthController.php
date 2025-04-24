<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'gender'      => 'required|string|in:male,female,other', 
            'email'       => 'required|email|unique:users',
            'phone'       => 'required|string|max:15',
            'username'    => 'required|string|max:255|unique:users',
            'password'    => 'required|string|min:6|confirmed',
            'avatar'      => 'nullable|string|max:255', 
            'ada_username' => 'required|string|max:255',
            'ada_key'     => 'required|string|max:255',
        ]);

        $user = User::create([
            'name'        => $request->name,
            'gender'      => $request->gender,
            'email'       => $request->email,
            'phone'       => $request->phone,
            'username'    => $request->username,
            'password'    => Hash::make($request->password),
            'avatar'      => $request->avatar ?? null,
            'ada_username' => $request->ada_username,
            'ada_key'     => $request->ada_key,
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['username' => $request->username, 'password' => $request->password])) {
            throw ValidationException::withMessages([
                'username' => ['Tên đăng nhập hoặc mật khẩu không đúng.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đã đăng xuất.']);
    }
}
