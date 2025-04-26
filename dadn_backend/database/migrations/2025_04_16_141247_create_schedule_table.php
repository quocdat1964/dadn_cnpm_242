<?php

// database/migrations/2025_04_19_000000_create_device_schedules_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('device_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('feed_key');     // 'led' hoặc 'pumper'
            $table->timestamp('start_at');  // thời điểm bắt đầu bật
            $table->timestamp('end_at');    // thời điểm kết thúc khoảng bật
            $table->boolean('enabled')->default(true); // nếu false thì lịch không có hiệu lực
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_schedules');
    }
};
