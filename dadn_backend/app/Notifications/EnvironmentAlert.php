<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class EnvironmentAlertEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $feedId;
    public $content;
    public $recordedAt;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($feedId, $content, $recordedAt)
    {
        $this->feedId = $feedId;
        $this->content = $content;
        $this->recordedAt = $recordedAt;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Ví dụ sử dụng kênh public
        return new Channel('environment-alerts');
    }
}
