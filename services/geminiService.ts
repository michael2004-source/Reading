
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

const languageCodeMap: { [key: string]: string } = {
    "English": "en",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Italian": "it",
    "Portuguese (Brazil)": "pt-BR",
    "Russian": "ru",
    "Japanese": "ja",
    "Korean": "ko",
    "Arabic": "ar",
    "Hindi": "hi",
    "Turkish": "tr",
};

export async function getDefinition(word: string, language: string): Promise<string> {
    const langCode = languageCodeMap[language] || 'en';
    const url = `https://api.dictionaryapi.dev/api/v2/entries/${langCode}/${word}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                return `Sorry, no definition could be found for "${word}" in ${language}.`;
            }
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data || data.length === 0) {
            return `Sorry, no definition could be found for "${word}" in ${language}.`;
        }
        
        const entry = data[0];
        let markdown = '';

        // Add phonetic transcription
        const phonetic = entry.phonetics?.find((p: any) => p.text)?.text;
        if (phonetic) {
            markdown += `*${phonetic}*\n\n`;
        }

        // Add meanings
        entry.meanings?.forEach((meaning: any) => {
            markdown += `### ${meaning.partOfSpeech}\n`;
            meaning.definitions?.forEach((def: any, index: number) => {
                markdown += `${index + 1}. ${def.definition}\n`;
                if (def.example) {
                    markdown += `   *Example: "${def.example}"*\n`;
                }
            });
            markdown += '\n';
        });

        return markdown.trim() || "Could not parse the definition.";

    } catch (error) {
        console.error("Error fetching definition from Dictionary API:", error);
        return "Sorry, there was an issue connecting to the dictionary service. Please check your network connection and try again.";
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
