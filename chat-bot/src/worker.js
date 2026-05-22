import { pipeline } from "@huggingface/transformers";
import { KokoroTTS } from "kokoro-js";

const progress_callback = (data) => self.postMessage(data);
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
    dtype: "fp32",
    device: "webgpu",
    progress_callback
});

const transcriber = await pipeline(
    "automatic-speech-recognition",
    "onnx-community/whisper-tiny.en",
    {
        device: "webgpu",
        progress_callback
    },
).catch((error) => {
    self.postMessage({ error });
    throw error;
});

const llm = await pipeline(
    "text-generation",
    "HuggingFaceTB/SmolLM2-1.7B-Instruct",
    {
        device: "webgpu",
        dtype: "q4f16",
        progress_callback
    }
);

self.postMessage({ status: "ready" });

self.addEventListener("message", async (event) => {
    const { audioData } = event.data;
    console.log("Worker received audio data:", audioData);
    const messages = [
        {
            role: "system",
            content:
                "You're a helpful and conversational voice assistant. Keep your responses short, clear, and casual.",
        },
    ];
    self.postMessage({
        type: "info",
        message: "Transcribing audio...",
        duration: "until_next",
    });
    const transcription = await transcriber(audioData);
    self.postMessage({
        type: "info",
        message: `Transcription: ${transcription.text}`,
    });
    messages.push({ role: "user", content: transcription.text });

    const output = await llm(messages, { max_new_tokens: 128, do_sample: true });
    console.log("LLM raw output:", output);
    const reply = output[0].generated_text.at(-1).content;
    console.log("LLM output:", reply);
    messages.push({ role: "assistant", content: reply });

    let result = await tts.generate(reply, { voice: "bm_daniel" });
    console.log("TTS result:", result);
    // Send the output back to the main thread
    self.postMessage(
        { status: "tts", audio: result.audio, sampleRate: 24000 },
        [result.audio.buffer]   // transfer instead of copy
    );
});
