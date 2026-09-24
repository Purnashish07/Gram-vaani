from gtts import gTTS
import os, uuid

def text_to_speech(text, lang='hi'):
    try:
        # gTTS supports 'hi' for Hindi
        tts_lang = 'hi' if 'hi' in lang or any('\u0900' <= c <= '\u097F' for c in text) else 'en'
        filename = f"static/tts_{uuid.uuid4().hex[:8]}.mp3"
        tts = gTTS(text=text, lang=tts_lang, slow=False)
        tts.save(filename)
        return filename
    except Exception as e:
        print("TTS Error:", e)
        return None
