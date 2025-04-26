<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('gender')->nullable();
            $table->string('phone')->nullable();
            $table->string('username')->unique()->after('email');
            $table->string('avatar')->nullable();
            $table->string('ada_username');
            $table->string('ada_key');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'gender', 'phone', 'username', 'avatar', 'ada_username', 'ada_key'
            ]);
        });
    }
};

