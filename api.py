from flask import Flask, request, jsonify
from adafruit_api import Adafruit_API

# Thông tin tài khoản Adafruit IO
FEED_ID_LIST = ['led', 'fan', 'pumper', 'air-humidity', 'light', 'soil-moisturer', 'temperature']

# Khởi tạo Flask app
app = Flask(__name__)

# Khởi tạo Adafruit API client
client = Adafruit_API(USERNAME, KEY, FEED_ID_LIST, port="MOCK")
client.connect()

@app.route('/api/devices', methods=['GET'])
def get_devices():
    """
    Lấy danh sách các thiết bị và trạng thái hiện tại.
    """
    devices = [
        {"id": "air-humidity", "name": "Air Humidity"},
        {"id": "light", "name": "Light"},
        {"id": "soil-moisturer", "name": "Soil Moisturer"},
        {"id": "temperature", "name": "Temperature"},
    ]
    return jsonify(devices)

@app.route('/api/control', methods=['POST'])
def control_device():
    """
    Điều khiển thiết bị (bật/tắt).
    Yêu cầu JSON:
    {
        "feed_id": "light",
        "value": "1"  # 1: bật, 0: tắt
    }
    """
    data = request.get_json()
    feed_id = data.get('feed_id')
    value = data.get('value')

    if feed_id not in FEED_ID_LIST:
        return jsonify({"error": "Invalid feed_id"}), 400

    client.publish(feed_id, value)
    return jsonify({"message": f"Sent {value} to {feed_id}"}), 200

@app.route('/api/status/<feed_id>', methods=['GET'])
def get_status(feed_id):
    """
    Lấy trạng thái của một thiết bị.
    """
    if feed_id not in FEED_ID_LIST:
        return jsonify({"error": "Invalid feed_id"}), 400

    # Trả về trạng thái giả lập (hoặc lấy từ Adafruit IO nếu cần)
    return jsonify({"feed_id": feed_id, "status": "unknown"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)