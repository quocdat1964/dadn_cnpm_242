<?php
// app/Events/EnvironmentUpdated.php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EnvironmentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** Dữ liệu sẽ gửi lên frontend */
    public $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function broadcastOn()
    {
        // Channel chung cho tất cả các feed
        return new Channel('environment');
    }

    // Nếu muốn custom payload
    public function broadcastWith()
    {
        return $this->data;
    }
}
