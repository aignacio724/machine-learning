import { useState, useRef, useEffect } from 'react'
import Progress from "./components/Progress";
import './App.css'

function App() {

  const [isRecording, setIsRecording] = useState(false);
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);

  // Create a reference to the worker object.
  const worker = useRef(null);
  const chunks = useRef([]);
  const mediaRecorderRef = useRef(null);

  const idOf = (d) => `${d.name}/${d.file}`;
  // We use the `useEffect` hook to setup the worker as soon as the `App` component is mounted.
  useEffect(() => {
    // Create the worker if it does not yet exist.
    worker.current ??= new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      console.log("Message received from worker:", e.data);
      switch (e.data.status) {
        case "initiate":
          // Model file start load: add a new progress item to the list.
          setReady(false);
          setProgressItems((prev) =>
            prev.some((item) => idOf(item) === idOf(e.data))
              ? prev
              : [...prev, e.data]
          );
          break;

        case "progress":
          // Model file progress: update one of the progress items.
          setProgressItems((prev) =>
            prev.map((item) =>
              idOf(item) === idOf(e.data) ? { ...item, progress: e.data.progress } : item
            )
          );
          break;

        case "done":
          // Model file loaded: remove the progress item from the list.
          setProgressItems((prev) => prev.filter((item) => idOf(item) !== idOf(e.data)));
          break;

        case "ready":
          // Pipeline ready: the worker is ready to accept messages.
          setReady(true);
          break;

        case "tts":
          const ctx = new AudioContext();
          const buffer = ctx.createBuffer(1, e.data.audio.length, e.data.sampleRate);
          buffer.copyToChannel(e.data.audio, 0);
          const src = ctx.createBufferSource();
          src.buffer = buffer;
          src.connect(ctx.destination);
          src.start();
          setDisabled(false);
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      worker.current.removeEventListener("message", onMessageReceived);
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    chunks.current = []; // reset at the start of each recording
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  }

  const stopRecording = () => {
    mediaRecorderRef.current.onstop = async () => {
      setDisabled(true);
      const ctx = new AudioContext({ sampleRate: 16000 });
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      console.log('Recording stopped, audio blob created:', blob);


      const arrayBuffer = await blob.arrayBuffer();
      const decodedAudio = await ctx.decodeAudioData(arrayBuffer);
      const waveform = await decodedAudio.getChannelData(0);
      console.log('Decoded audio data:', decodedAudio);
      worker.current.postMessage({
        audioData: waveform
      });
      chunks.current = []; // clear the chunks for the next recording
    }
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }

  return (
    <>
      <h1>Transformers.js</h1>
      <h2>ML-powered voice chat bot in React!</h2>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop" : "Record"}
      </button>
      <div className="progress-bars-container">
        {ready === false && <label>Loading models... (only run once)</label>}
        {progressItems.map((data) => (
          <div key={idOf(data)}>
            <Progress text={`${data.name} — ${data.file}`} percentage={data.progress} />
          </div>
        ))}
      </div>
    </>
  )
}

export default App
