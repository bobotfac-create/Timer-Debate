import { useState } from 'react';
import { generateMotionFromAI } from '../data/geminiService';

export const useMotionGenerator = () => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Politica');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API Key no encontrada.");
        }
        const text = await generateMotionFromAI(topic, type, apiKey);
        setResult(text);
    } catch (err: any) {
        console.error(err);
        let errorMsg = "Error desconocido.";
        if (err instanceof Error) errorMsg = err.message;
        setError(errorMsg);
    } finally {
        setLoading(false);
    }
  };

  return {
    topic, setTopic,
    type, setType,
    loading,
    result,
    error,
    generate
  };
};