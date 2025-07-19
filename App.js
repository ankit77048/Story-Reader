import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const populateVoices = () => {
      const voicesList = synth.getVoices();
      setVoices(voicesList);
      if (voicesList.length > 0 && !selectedVoice) {
        setSelectedVoice(voicesList[0].name);
      }
    };
    populateVoices();
    synth.onvoiceschanged = populateVoices;
  }, []);

  const handleSpeak = () => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices.find(v => v.name === selectedVoice);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.onboundary = (event) => {
      highlightWord(event.charIndex, event.charLength || 1);
    };
    utterance.onend = () => clearHighlights();
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const highlightWord = (start, length) => {
    const highlighted = text.substring(0, start) + 
      "<mark>" + text.substring(start, start + length) + "</mark>" + 
      text.substring(start + length);
    document.getElementById("highlighted-text").innerHTML = highlighted;
  };

  const clearHighlights = () => {
    document.getElementById("highlighted-text").innerText = text;
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    clearHighlights();
  };

  return (
    <div className="container">
      <h1>📢 बहुभाषी Text-to-Speech Reader</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type in Hindi or English..."
      />
      <div id="highlighted-text">{text}</div>
      <label>Select Voice:</label>
      <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
        {voices.map((voice, index) => (
          <option key={index} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
      <label>Pitch: {pitch}</label>
      <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(e.target.value)} />
      <label>Rate: {rate}</label>
      <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
      <div className="buttons">
        <button onClick={handleSpeak}>🔊 Read Aloud</button>
        <button onClick={handleStop}>🛑 Stop</button>
      </div>
    </div>
  );
}
