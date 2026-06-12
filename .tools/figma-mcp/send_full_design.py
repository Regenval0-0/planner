import asyncio
import websockets
import json

RELAY_URL = "ws://127.0.0.1:8888?channel=REN2026&type=figma"

async def send_design():
    async with websockets.connect(RELAY_URL) as ws:
        print("Connected!")
        await asyncio.sleep(1)

        message = {
            "type": "batch_create",
            "operations": [
                # Main card frame with rounded corners
                {
                    "type": "create_frame",
                    "name": "Card",
                    "x": 100,
                    "y": 100,
                    "width": 340,
                    "height": 240,
                    "fills": [{"type": "SOLID", "color": {"r": 1, "g": 1, "b": 1}}],
                    "strokeWeight": 1,
                    "strokeAlign": "INSIDE",
                    "strokes": [{"type": "SOLID", "color": {"r": 0.85, "g": 0.85, "b": 0.85}}],
                    "cornerRadius": 16,
                    "effects": [
                        {
                            "type": "DROP_SHADOW",
                            "color": {"r": 0, "g": 0, "b": 0, "a": 0.1},
                            "offset": {"x": 0, "y": 4},
                            "radius": 12,
                            "spread": 0
                        }
                    ]
                },
                # Header gradient background
                {
                    "type": "create_rectangle",
                    "name": "Header",
                    "x": 100,
                    "y": 100,
                    "width": 340,
                    "height": 70,
                    "fills": [{"type": "SOLID", "color": {"r": 0.24, "g": 0.44, "b": 0.9}}],
                    "topLeftRadius": 16,
                    "topRightRadius": 16,
                    "bottomLeftRadius": 0,
                    "bottomRightRadius": 0
                },
                # Title text
                {
                    "type": "create_text",
                    "name": "Title",
                    "x": 120,
                    "y": 125,
                    "characters": "Привет из Claude! 👋",
                    "fontSize": 24,
                    "fontName": {"family": "Inter", "style": "Bold"},
                    "fills": [{"type": "SOLID", "color": {"r": 1, "g": 1, "b": 1}}]
                },
                # Body text
                {
                    "type": "create_text",
                    "name": "Body",
                    "x": 120,
                    "y": 195,
                    "characters": "Это тестовый дизайн, созданный\nполностью автоматически через\nWebSocket + Figma Plugin API",
                    "fontSize": 14,
                    "fontName": {"family": "Inter", "style": "Regular"},
                    "fills": [{"type": "SOLID", "color": {"r": 0.3, "g": 0.3, "b": 0.3}}]
                },
                # Decorative circle
                {
                    "type": "create_ellipse",
                    "name": "Decor",
                    "x": 370,
                    "y": 110,
                    "width": 40,
                    "height": 40,
                    "fills": [{"type": "SOLID", "color": {"r": 1, "g": 0.8, "b": 0.2}}]
                },
                # Status badge
                {
                    "type": "create_rectangle",
                    "name": "Badge",
                    "x": 120,
                    "y": 280,
                    "width": 100,
                    "height": 28,
                    "cornerRadius": 14,
                    "fills": [{"type": "SOLID", "color": {"r": 0.2, "g": 0.8, "b": 0.4}}]
                },
                {
                    "type": "create_text",
                    "name": "BadgeText",
                    "x": 135,
                    "y": 286,
                    "characters": "Авто 🤖",
                    "fontSize": 12,
                    "fontName": {"family": "Inter", "style": "Medium"},
                    "fills": [{"type": "SOLID", "color": {"r": 1, "g": 1, "b": 1}}]
                }
            ]
        }

        await ws.send(json.dumps(message))
        print("Full design sent!")

        try:
            response = await asyncio.wait_for(ws.recv(), timeout=5)
            print(f"Response: {response}")
        except asyncio.TimeoutError:
            print("No response (timeout)")

if __name__ == "__main__":
    asyncio.run(send_design())
