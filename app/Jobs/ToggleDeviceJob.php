<?php
// app/Jobs/ToggleDeviceJob.php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Http\Controllers\DeviceController;
use Illuminate\Http\Request;

class ToggleDeviceJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    protected $feedKey;
    protected $value;

    public function __construct(string $feedKey, int $value)
    {
        $this->feedKey = $feedKey;
        $this->value = $value;
    }

    public function handle()
    {
        // gọi thẳng DeviceController->toggle(...)
        $req = new Request([
            'feed_key' => $this->feedKey,
            'value' => $this->value,
        ]);
        app(DeviceController::class)->toggle($req);
    }
}