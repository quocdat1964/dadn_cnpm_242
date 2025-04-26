<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('records', function (Blueprint $table) {
            $table->id();//PK
            $table->foreignId('sensor_id')->constrained()->onDelete('cascade'); // FK đến sensors
            $table->float('value');         // Giá trị đo được
            $table->timestamp('recorded_at'); // Thời điểm đo từ feed
            $table->timestamps();           // created_at = khi lưu DB
            $table->unique(['sensor_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('records');
    }
};
