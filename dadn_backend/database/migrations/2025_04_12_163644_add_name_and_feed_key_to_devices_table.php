<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->string('name')->unique()->after('id');
            $table->string('feed_key')->unique()->after('name');
        });
    }

    public function down(): void
    {
        // Dùng Schema::hasColumn để tránh lỗi nếu cột không tồn tại
        if (Schema::hasColumn('devices', 'feed_key')) {
            Schema::table('devices', function (Blueprint $table) {
                $table->dropColumn('feed_key');
            });
        }
        if (Schema::hasColumn('devices', 'name')) {
            Schema::table('devices', function (Blueprint $table) {
                $table->dropColumn('name');
            });
        }
    }
};
