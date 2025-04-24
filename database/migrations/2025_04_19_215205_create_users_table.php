<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('gender')->nullable();        // Giới tính
            $table->string('email')->unique();
            $table->string('phone')->nullable();         // Số điện thoại
            $table->string('username')->unique();        // Tên đăng nhập
            $table->string('password');                  // Mật khẩu (đã mã hóa)
            $table->string('avatar')->nullable();        // Tên file ảnh avatar
            $table->string('ada_username')->nullable();  // Adafruit Username
            $table->string('ada_key')->nullable(); // Adafruit Key
            $table->rememberToken();     
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
