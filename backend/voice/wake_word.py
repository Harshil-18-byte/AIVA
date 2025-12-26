import pvporcupine  # type: ignore
import sounddevice as sd
import struct

porcupine = pvporcupine.create(
    access_key="YOUR_PICOVOICE_KEY",
    keywords=["hey aiva"]
)

def listen(callback): # type: ignore
    def audio_cb(indata, frames, time, status):
        pcm = struct.unpack_from("h" * frames, indata)
        if porcupine.process(pcm) >= 0:
            callback()

    with sd.InputStream(
        samplerate=porcupine.sample_rate,
        channels=1,
        dtype="int16",
        callback=audio_cb
    ):
        sd.sleep(10**9)
