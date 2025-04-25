<!-- resources/views/emails/sensor_alert.blade.php -->

<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Cảnh báo {{ $sensorName }}</title>
</head>

<body>
    <p>Giá trị đo được: <strong>{{ $value }}</strong></p>
    <p>Ngưỡng tối thiểu: <strong>{{ $min }}</strong></p>
    <p>Ngưỡng tối đa: <strong>{{ $max }}</strong></p>
    <p>Thời gian đo: <strong>{{ $time }}</strong></p>

    <hr>
    <p>Vui lòng kiểm tra và điều chỉnh hệ thống nếu cần.</p>
</body>

</html>