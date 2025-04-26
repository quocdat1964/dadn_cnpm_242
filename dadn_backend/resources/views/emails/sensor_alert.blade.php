<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Cảnh báo cảm biến</title>
</head>

<body>
    <h2>Cảnh báo: {{ $feedKey }}</h2>
    <p>Giá trị đo được: <strong>{{ $value }}</strong></p>
    <p>Ngưỡng cho phép: {{ $min }} — {{ $max }}</p>
    <p>Thời điểm: {{ $recordedAt }}</p>
    <hr>
    <p>Vui lòng kiểm tra hệ thống của bạn.</p>
</body>

</html>