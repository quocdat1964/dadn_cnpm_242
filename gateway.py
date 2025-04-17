# from adafruit_api import Adafruit_API
# import time
# from threading import Thread

# # Thông tin tài khoản Adafruit IO

# # Danh sách các feed cần kết nối
# FEED_ID_LIST = ['led', 'fan', 'pumper', 'air-humidity', 'light', 'soil-moisturer', 'temperature']
# # Hàm kiểm tra trạng thái dâu tây và gửi dữ liệu lên Adafruit IO
# def CheckTomatoStatus(client):
#     status = None
#     counter = 0
#     while True:
#         if counter == 0:
#             # Giả lập trạng thái dâu tây (có thể thay bằng hàm thực tế như RunCamera)
#             status = "Healthy"  # Ví dụ: trạng thái dâu tây
#             client.publish('tomato-status', status)
#             counter = 20  # Reset bộ đếm
#         counter -= 1
#         time.sleep(1)

# # Khởi tạo client Adafruit API
# client = Adafruit_API(USERNAME, KEY, FEED_ID_LIST, port="MOCK")

# # Kết nối đến Adafruit IO
# client.connect()

# # Tạo một luồng riêng để kiểm tra trạng thái dâu tây
# strawThread = Thread(target=CheckTomatoStatus, args=[client])
# strawThread.daemon = True  # Đảm bảo luồng dừng khi chương trình chính kết thúc
# strawThread.start()

# # Vòng lặp chính để đọc dữ liệu từ UART và xử lý
# while True:
#     client.read_serial()  # Đọc dữ liệu từ UART và xử lý
#     time.sleep(1)



import requests
from adafruit_api import Adafruit_API
import time
from threading import Thread

# Thông tin tài khoản Adafruit IO

# Laravel backend URL
BACKEND_URL = 'http://127.0.0.1:8000/api/sensors/data'
DEVICE_SYNC_URL = 'http://127.0.0.1:8000/api/devices/sync-control'
# Danh sách các feed cần kết nối
FEED_ID_LIST = ['led', 'fan', 'pumper', 'air-humidity', 'light', 'soil-moisturer', 'temperature']

# Hàm gửi dữ liệu đến backend Laravel
def send_to_backend(feed_id, value):
    try:
        response = requests.post(BACKEND_URL, json={
            'feed_id': feed_id,
            'value': value
        })
        if response.status_code == 200:
            print(f"Data sent to backend: {feed_id} = {value}")
        else:
            print(f"Failed to send data to backend: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error sending data to backend: {e}")
def sync_device(feed_key, value):
    try:
        response = requests.post(DEVICE_SYNC_URL, json={
            'feed_key': feed_key,
            'value': value
        })
        if response.status_code == 200:
            print(f"Device synced: {feed_key} = {value}")
        else:
            print(f"Failed to sync device: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error syncing device: {e}")

# def send_notification(feed_id, value, recorded_at):
#     payload = {
#         'feed_id': feed_id,
#         'value': value,
#         'recorded_at': recorded_at
#     }
#     try:
#         response = requests.post(NOTIFICATION_URL, json=payload)
#         if response.status_code == 200:
#             print(f"Notification sent for {feed_id}: {value}")
#         else:
#             print(f"Failed to send notification: {response.status_code} - {response.text}")
#     except Exception as e:
#         print(f"Error sending notification: {e}")

# Hàm kiểm tra trạng thái dâu tây và gửi dữ liệu lên Adafruit IO
def CheckTomatoStatus(client):
    status = None
    counter = 0
    while True:
        if counter == 0:
            # Giả lập trạng thái dâu tây (có thể thay bằng hàm thực tế như RunCamera)
            status = "Healthy"  # Ví dụ: trạng thái dâu tây
            client.publish('tomato-status', status)
            counter = 20  # Reset bộ đếm
        counter -= 1
        time.sleep(1)

# Khởi tạo client Adafruit API
client = Adafruit_API(USERNAME, KEY, FEED_ID_LIST, port="MOCK")

# Ghi đè hàm xử lý tin nhắn để gửi dữ liệu đến backend
def custom_message(client, feed_id, payload):
    print(f"Received message: {feed_id} = {payload}")
    if feed_id in ['light', 'pumper']:
        sync_device(feed_id, payload)
    else:
        send_to_backend(feed_id, payload)

client.message = custom_message

# Kết nối đến Adafruit IO
client.connect()

# Tạo một luồng riêng để kiểm tra trạng thái dâu tây
strawThread = Thread(target=CheckTomatoStatus, args=[client])
strawThread.daemon = True  # Đảm bảo luồng dừng khi chương trình chính kết thúc
strawThread.start()

# Vòng lặp chính để đọc dữ liệu từ UART và xử lý
while True:
    client.read_serial()  # Đọc dữ liệu từ UART và xử lý
    time.sleep(1)