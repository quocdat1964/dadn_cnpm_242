import serial.tools.list_ports
import json

# class Uart:
#     def __init__(self,port,client):
#         self.port = port
#         self.serial = None
#         self.client = client
#         self.message = ''
#     def init_connection(self):
#         self.serial = serial.Serial( port=self.port, baudrate=115200)
#         print('Uart connection is already!')
#     def write_message(self,data):
#         self.serial.write((str(data)).encode('utf-8'))
#     def read_serial(self):
#         bytesToRead = self.serial.inWaiting()
#         if (bytesToRead > 0):
#             self.message = self.message + self.serial.read(bytesToRead).decode("UTF-8")
#             while('!' in self.message and '#' in self.message):
#                 start = self.message.find('!')
#                 end = self.message.find('#')
#                 self.process_data(self.message[start:end+1])
#                 self.message = self.message[end+1:]
#     def process_data(self,data):
#         data = data[1:-1]
#         print(data) #
#         data_from_sensor = json.loads(data)
#         print(data_from_sensor)
#         if "temperature" in data_from_sensor:
#             self.client.publish("temperature-sensor", data_from_sensor['temperature'])
#         elif "light" in data_from_sensor:
#             self.client.publish("light-sensor", data_from_sensor['light'])
#         elif "humidity" in data_from_sensor:
#             self.client.publish("humidity-sensor", data_from_sensor['humidity'])
#         elif "soil-humidity" in data_from_sensor:
#             self.client.publish("soil-humidity", data_from_sensor['soil-humidity'])

class Uart:
    def __init__(self, port, api):
        self.port = port
        self.api = api
        self.buffer = []  # Bộ đệm giả lập để lưu dữ liệu

    def init_connection(self):
        print(f"Mock UART initialized on port {self.port}")

    def write_message(self, message):
        print(f"Mock UART sent: {message}")
        # Giả lập phản hồi từ thiết bị
        self.buffer.append(f"Response to {message}")

    def read_serial(self):
        if self.buffer:
            # Giả lập đọc dữ liệu từ thiết bị
            response = self.buffer.pop(0)
            print(f"Mock UART received: {response}")