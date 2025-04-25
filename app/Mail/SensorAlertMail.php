<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SensorAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $sensorName;
    public float $value;
    public float $warningMin;
    public float $warningMax;
    public string $recordedAt;

    /**
     * @param  string  $sensorName    Tên cảm biến (ví dụ "Temperature")
     * @param  float   $value         Giá trị đo được
     * @param  float   $warningMin    Ngưỡng tối thiểu
     * @param  float   $warningMax    Ngưỡng tối đa
     * @param  string  $recordedAt    Thời điểm đo (chuỗi)
     */
    public function __construct(
        string $sensorName,
        float $value,
        float $warningMin,
        float $warningMax,
        string $recordedAt
    ) {
        $this->sensorName = $sensorName;
        $this->value = $value;
        $this->warningMin = $warningMin;
        $this->warningMax = $warningMax;
        $this->recordedAt = $recordedAt;
    }

    public function build()
    {
        return $this
            ->subject("⚠️ Cảnh báo: {$this->sensorName} vượt ngưỡng")
            ->view('emails.sensor_alert')
            ->with([
                'sensorName' => $this->sensorName,
                'value' => $this->value,
                'min' => $this->warningMin,
                'max' => $this->warningMax,
                'time' => $this->recordedAt,
            ]);
    }
}
