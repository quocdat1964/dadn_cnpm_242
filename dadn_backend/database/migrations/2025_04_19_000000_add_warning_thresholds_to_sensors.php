<?php
// database/migrations/2025_04_19_000000_add_warning_thresholds_to_sensors.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWarningThresholdsToSensors extends Migration
{
    public function up()
    {
        Schema::table('sensors', function (Blueprint $table) {
            // ngưỡng thấp, ngưỡng cao
            $table->float('warning_min')->default(0.0)->after('feed_key');
            $table->float('warning_max')->default(100.0)->after('warning_min');
        });
    }

    public function down()
    {
        Schema::table('sensors', function (Blueprint $table) {
            $table->dropColumn(['warning_min', 'warning_max']);
        });
    }
}
