<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SensorAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public $feedKey;
    public $value;
    public $min;
    public $max;
    public $recordedAt;

    public function __construct($feedKey, $value, $min, $max, $recordedAt)
    {
        $this->feedKey = $feedKey;
        $this->value = $value;
        $this->min = $min;
        $this->max = $max;
        $this->recordedAt = $recordedAt;
    }

    public function build()
    {
        return $this
            ->subject("⚠️ Cảnh báo {$this->feedKey}")
            ->view('emails.sensor_alert')     // dùng Blade view bình thường
            ->with([
                'feedKey' => $this->feedKey,
                'value' => $this->value,
                'min' => $this->min,
                'max' => $this->max,
                'recordedAt' => $this->recordedAt,
            ]);
    }
}
