import asyncio
import websockets
import json

RELAY_URL = "ws://127.0.0.1:8888?channel=REN2026&type=client"

async def send_design():
    async with websockets.connect(RELAY_URL) as ws:
        print("Connected to relay!")

        # Create a simple card design
        message = {
            "type": "batch_create",
            "operations": [
                {
                    "type": "create_frame",
                    "name": "Card",
                    "x": 100,
                    "y": 100,
                    "width": 300,
                    "height": 200,
                    "fills": [{"type": "SOLID", "color": {"r": 1, "g": 1, "b": 1}}]
                },
                {
                    "type": "create_rectangle",
                    "name": "Header",
                    "x": 100,
                    "y": 100,
                    "width": 300,
                    "height": 60,
                    "fills": [{"type": "SOLID", "color": {"r": 0.2, "g": 0.4, "b": 0.8}}]
                },
                {
                    "type": "create_text",
                    "name": "Title",
                    "x": 120,
                    "y": 120,
                    "characters": "Привет из Claude!",
                    "fontSize": 24,
                    "fills": [{"type": "SOLID", "color": {"r": 1, "g": 1, "b": 1}}]
                },
                {
                    "type": "create_text",
                    "name": "Body",
                    "x": 120,
                    "y": 190,
                    "characters": "Это тестовый дизайн\nсозданный автоматически",
                    "fontSize": 16,
                    "fills": [{"type": "SOLID", "color": {"r": 0.2, "g": 0.2, "b": 0.2}}]
                }
            ]
        }

        await ws.send(json.dumps(message))
        print("Design command sent!")

        # Wait for response
        try:
            response = await asyncio.wait_for(ws.recv(), timeout=5)
            print(f"Response: {response}")
        except asyncio.TimeoutError:
            print("No response received (timeout)")

if __name__ == "__main__":
    asyncio.run(send_design())
