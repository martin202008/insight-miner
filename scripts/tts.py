#!/usr/bin/env python3
"""
TTS using edge-tts.
Usage: python3 scripts/tts.py <voice> <output_path> [style] < <text>
Example: python3 scripts/tts.py zh-CN-XiaoxiaoNeural /tmp/test.mp3 newscast < input.txt
"""

import sys
import asyncio
import json
from edge_tts import Communicate

async def generate_speech(text: str, voice: str, output_path: str, style: str = None):
    try:
        # Use SSML with mstts:express-as for styles
        if style and style != "default":
            ssml = f"""<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='zh-CN'>
                <voice name='{voice}'>
                    <mstts:express-as style='{style}'>
                        {text}
                    </mstts:express-as>
                </voice>
            </speak>"""
            communicate = Communicate(ssml)
        else:
            communicate = Communicate(text, voice)

        await communicate.save(output_path)

        result = {
            "success": True,
            "outputPath": output_path,
        }
        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: tts.py <voice> <output_path> [style] < <text>"}))
        sys.exit(1)

    voice = sys.argv[1]
    output_path = sys.argv[2]
    style = sys.argv[3] if len(sys.argv) > 3 else None

    # Read text from stdin
    text = sys.stdin.read()

    asyncio.run(generate_speech(text, voice, output_path, style))
