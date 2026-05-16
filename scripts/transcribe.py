#!/usr/bin/env python3
"""
Transcribe audio using faster-whisper.
Usage: python3 scripts/transcribe.py <audio_path> <model_size>
Example: python3 scripts/transcribe.py uploads/videos/xxx_audio.wav small
"""

import sys
import json
from faster_whisper import WhisperModel

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: transcribe.py <audio_path> <model_size>"}))
        sys.exit(1)

    audio_path = sys.argv[1]
    model_size = sys.argv[2] or "small"

    try:
        # Run transcription
        model = WhisperModel(model_size, compute_type="auto")
        segments, info = model.transcribe(audio_path, beam_size=5)

        result = {
            "fullText": "",
            "duration": info.duration or 0,
            "segments": []
        }

        texts = []
        for segment in segments:
            result["segments"].append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip()
            })
            texts.append(segment.text)

        result["fullText"] = " ".join(texts)

        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
