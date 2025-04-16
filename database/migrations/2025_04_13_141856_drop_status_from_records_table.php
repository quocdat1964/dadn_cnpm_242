<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('records', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }

    public function down(): void
    {
        Schema::table('records', function (Blueprint $table) {
            // Phục hồi lại cột status với kiểu dữ liệu phù hợp, ví dụ: string, nullable
            $table->string('status')->nullable();
        });
    }
};
