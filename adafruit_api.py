from Adafruit_IO import MQTTClient
import sys
from uart import Uart
import paho.mqtt.client as mqtt
class Adafruit_API:
    def __init__(self,username,key,feed_id_list,port = "MOCK"):
        self.username = username
        self.feed_id_list = feed_id_list
        self.key = key
        self.mqtt_client = None
        self.uart = None
        self.port = port
    def connected(self,client):
        print("Connected to server!")
        for feed_id in self.feed_id_list:
            print("Subscribe to " + feed_id)
            client.subscribe(feed_id)
    def subscribe(self,client,userdata, mid , granted_qos):
        print("Subscribe successful!")
    def disconnected(client):
        print("Disconnect succcessful!")
        sys.exit(1)
    def message(self, client, feed_id, payload):
        print(f"Receive from {feed_id}: {payload}")

        # Xử lý các feed cụ thể
        if feed_id == 'light':
            if payload == '1':
                print("Turn on light")
                self.uart.write_message("A")
            elif payload == '0':
                print("Turn off light")
                self.uart.write_message("B")
        elif feed_id == 'pumper':
            if payload == '1':
                print("Turn on pumper")
                self.uart.write_message("D")
            elif payload == '0':
                print("Turn off pumper")
                self.uart.write_message("E")
        elif feed_id == 'fan':
            print(f"Fan control: {payload}")
            self.uart.write_message("C" + payload)
        elif feed_id == 'air-humidity':
            print(f"Air Humidity: {payload}")
        elif feed_id == 'soil-moisturer':
            print(f"Soil Moisture: {payload}")
        elif feed_id == 'temperature':
            print(f"Temperature: {payload}")
        else:
            print(f"Unknown feed: {feed_id}")  
    def publish(self,feed_id,data):
        print("Publish to " + feed_id + " : " + str(data))
        self.mqtt_client.publish(feed_id,data)
    def connect(self):
        self.mqtt_client = MQTTClient(self.username,self.key)
        self.mqtt_client.on_connect = self.connected
        self.mqtt_client.on_disconnect = self.disconnected
        self.mqtt_client.on_message = self.message
        self.mqtt_client.on_subscribe = self.subscribe
        self.mqtt_client.connect()
        self.uart = Uart(self.port,self)
        self.uart.init_connection()
        self.mqtt_client.loop_background()
    def read_serial(self):
        self.uart.read_serial()