<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Đặt lại mật khẩu</title>
</head>
<body>
    <p>Chào {{ $user->name ?? $user->username }},</p>
    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Smart Tomato Farm.</p>
    <p>Vui lòng nhấn vào link dưới đây để đặt lại mật khẩu:</p>
    <p><a href="{{ $url }}">{{ $url }}</a></p>
    <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    <br>
    <p>Trân trọng,<br>Smart Tomato Farm</p>
</body>
</html>
