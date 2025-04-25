<?php
// app/Events/NewSensorData.php

namespace App\Events;

use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class NewSensorData
{
    use SerializesModels;

    public string $feedId;
    public float $value;
    public Carbon $recordedAt;
    public ?string $email;
    public ?string $telegramChatId;

    public function __construct(string $feedId, float $value, Carbon $recordedAt, ?string $email, ?int $telegramChatId)
    {
        $this->feedId = $feedId;
        $this->value = $value;
        $this->recordedAt = $recordedAt;
        $this->email = $email;
        $this->telegramChatId = $telegramChatId;
    }
}
