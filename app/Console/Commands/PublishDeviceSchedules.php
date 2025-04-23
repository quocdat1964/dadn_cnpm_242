<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DeviceSchedule;
use Carbon\Carbon;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;  

class PublishDeviceSchedules extends Command
{
    protected $signature = 'mqtt:publish-schedules';
    protected $description = 'Publish on/off commands to Adafruit IO via MQTT according to DeviceSchedule';

    public function handle()
    {
        $now = Carbon::now()->format('Y-m-d H:i:00');
        // Lấy tất cả schedule enabled có start_at == now
        $toOn = DeviceSchedule::where('enabled', true)
            ->whereRaw("DATE_FORMAT(start_at, '%Y-%m-%d %H:%i:00') = ?", [$now])
            ->get();

        // Và tất cả schedule enabled có end_at == now
        $toOff = DeviceSchedule::where('enabled', true)
            ->whereRaw("DATE_FORMAT(end_at,   '%Y-%m-%d %H:%i:00') = ?", [$now])
            ->get();

        if ($toOn->isEmpty() && $toOff->isEmpty()) {
            return 0; // không có việc gì
        }

        // Khởi MQTT client
        $host = config('services.adafruit.mqtt_host');
        $port = config('services.adafruit.mqtt_port');
        $user = config('services.adafruit.mqtt_username');
        $pass = config('services.adafruit.mqtt_key');

        $client = new MqttClient($host, $port, 'laravel-scheduler-' . uniqid());
        $settings = (new ConnectionSettings)
            ->setUsername($user)
            ->setPassword($pass)
            ->setUseTls(true);

        $client->connect($settings, true);

        // Publish “1” cho những schedule khởi động
        foreach ($toOn as $sch) {
            $topic = "{$user}/feeds/{$sch->feed_key}";
            $client->publish($topic, '1', MqttClient::QOS_AT_MOST_ONCE);
            $this->info("Published ON to {$topic}");
        }

        // Publish “0” cho những schedule kết thúc
        foreach ($toOff as $sch) {
            $topic = "{$user}/feeds/{$sch->feed_key}";
            $client->publish($topic, '0', MqttClient::QOS_AT_MOST_ONCE);
            $this->info("Published OFF to {$topic}");
        }

        $client->disconnect();
        return 0;
    }
}
