<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Thêm cột recorded_at kiểu timestamp, nếu muốn để null thì thêm nullable()
            $table->timestamp('recorded_at')->nullable()->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('recorded_at');
        });
    }
};
