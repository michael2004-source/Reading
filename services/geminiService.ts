
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  // This is a fallback for development, but the app expects the key to be set.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY" });

// Helper function to decode base64 string to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to decode raw PCM audio data into an AudioBuffer
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export async function getDefinition(word: string, language: string): Promise<string> {
    const prompt = `Provide a dictionary-style definition for the word "${word}" in ${language}. Structure your response using markdown.
- If available, include the phonetic transcription in italics on the first line.
- Use a level 3 heading (###) for each part of speech (e.g., ### Noun, ### Verb).
- Under each part of speech, use a numbered list for distinct meanings.
- For each meaning, provide a concise definition followed by an example sentence in italics on a new line, indented.

Example response for 'ephemeral':

*/əˈfem(ə)rəl/*

### Adjective
1. Lasting for a very short time.
   *Example: "The beauty of the cherry blossoms is ephemeral."*
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: `You are a helpful dictionary assistant. Your definitions should be in ${language}, clear, concise, and follow the requested markdown format precisely. Do not add any conversational filler.`,
                temperature: 0.1, // Low temperature for factual, consistent output
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("No definition was returned by the model.");
        }
        return text;
    } catch (error) {
        console.error("Error fetching definition from Gemini API:", error);
        return "Sorry, I couldn't fetch a definition for that word. The API might be unavailable or the request could not be processed. Please try again later.";
    }
}

export async function getAudioForWord(word: string): Promise<AudioBuffer | null> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: word }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A clear, neutral voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            // The API returns audio at 24000Hz sample rate.
            // FIX: Cast window to any to access webkitAudioContext without TypeScript errors.
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const decodedBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
            return audioBuffer;
        }
        return null;

    } catch (error) {
        console.error("Error generating audio for word:", error);
        return null;
    }
}
