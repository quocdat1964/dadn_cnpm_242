<?php
namespace App\Listeners;

use App\Events\NewSensorData;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Log;

class SendSensorNotification
{
    public function handle(NewSensorData $event)
    {
        try {
            // Gọi controller hoặc service
            app(NotificationController::class)
                ->evaluateAndNotify(
                    request()->replace([
                        'feed_id' => $event->feedId,
                        'recorded_at' => $event->recordedAt->toDateTimeString(),
                        'email' => $event->email,
                        'telegram_chat_id' => $event->telegramChatId,
                    ])
                );
        } catch (\Throwable $e) {
            Log::error("Error sending notification: " . $e->getMessage());
        }
    }
}
