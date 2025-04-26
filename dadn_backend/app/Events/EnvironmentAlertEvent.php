<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class EnvironmentAlertEvent implements ShouldBroadcast
{
    use SerializesModels;

    public $feed_id;
    public $content;
    public $recorded_at;

    /**
     * Create a new event instance.
     *
     * @param  string  $feed_id
     * @param  string  $content
     * @param  \Carbon\Carbon  $recorded_at
     * @return void
     */
    public function __construct(string $feed_id, string $content, $recorded_at)
    {
        $this->feed_id = $feed_id;
        $this->content = $content;
        $this->recorded_at = $recorded_at->toDateTimeString();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Ví dụ: sử dụng kênh chung cho tất cả thông báo
        return new Channel('environment-alerts');
    }

    public function broadcastAs()
    {
        return 'EnvironmentAlert';
    }
}
