# Voice Chatbot using Transformers.js

This is a small voice chatbot that utilizes Transformers.js from Hugging Face. This small React App is just a chatbot that you can interact with verbally. Pressing the push-to-talk button allows you to interact with the chatbot and after interpreting the user's voice query, the chatbot will utilize the LLM to synthesize a text response and feed that response into the TTS KoKoro JS to audibly respond to the user in kind.

- [🤗 Transformers.js](https://huggingface.co/docs/transformers.js)
- [SmolLM v2](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct)
- [Kokoro JS](https://github.com/hexgrad/kokoro)

## Installing and running

To install via NPM, run:
```
npm install
```
This should install the necessary packages to run this chatbot locally

Running the chatbot, run
```
npm run dev
``` 
This should spin up a local react app
