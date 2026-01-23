"use client";
import React, { useState } from "react";

const HomePage = () => {
  // 1. 基础状态
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  
  // 2. 新增状态：是否正在生成中？生成好的音频在哪？
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedFile(file);
        setGeneratedAudio(null); // 换文件后清空旧结果
      } else {
        alert("请选择一个音频文件 (MP3, WAV, etc.)");
      }
    }
  };

  const handleFileRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setGeneratedAudio(null);
  };

  const triggerFileInput = () => {
    document.getElementById("hidden-file-input")?.click();
  };

  // 🎯 核心逻辑：调用真后台
  const handleGenerate = async () => {
    if (!selectedFile || !text) return;

    setIsGenerating(true);
    setGeneratedAudio(null);

    try {
      // 1. 打包数据
      const formData = new FormData();
      formData.append("audio", selectedFile);
      formData.append("text", text);

      // 2. 发送给我们的 API 隧道
      const response = await fetch("/api/clone", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Generation failed"));
        setIsGenerating(false);
        return;
      }

      // 3. 接收并播放音频
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudio(audioUrl);

    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white overflow-y-auto">
      <input
        type="file"
        id="hidden-file-input"
        className="hidden"
        accept="audio/*"
        onChange={handleFileChange}
      />

      <div className="container mx-auto px-4 py-16 flex flex-col items-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-widest mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          Voice Cloner
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 text-center max-w-2xl">
          Upload a voice sample, type your text, and let AI do the magic.
        </p>

        <div className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          
          {/* Step 1: Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-purple-300 mb-2 uppercase tracking-wider">
              Step 1: Reference Audio
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all group ${
                selectedFile
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-600 hover:border-purple-400 hover:bg-white/5"
              }`}
              onClick={!isGenerating ? triggerFileInput : undefined}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-600 p-3 rounded-full">
                      <span className="text-2xl">🎤</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{selectedFile.name}</p>
                      <p className="text-sm text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!isGenerating && (
                    <button onClick={handleFileRemove} className="p-2 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400">
                      ✖
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-lg text-gray-300 group-hover:text-white">Click to Upload Audio Sample</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Text Input */}
          <div className="mb-10">
            <label className="block text-sm font-medium text-blue-300 mb-2 uppercase tracking-wider">
              Step 2: Input Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isGenerating}
              placeholder="Type something here for the AI to read..."
              className="w-full h-32 bg-black/30 border border-gray-600 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Step 3: Generate Button */}
          <button
            onClick={handleGenerate}
            className={`w-full py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              isGenerating
                ? "bg-gray-700 cursor-wait text-gray-300"
                : selectedFile && text
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] shadow-lg shadow-purple-900/50 text-white"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!selectedFile || !text || isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Generate Speech 🚀"
            )}
          </button>

          {/* Step 4: Result */}
          {generatedAudio && (
            <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 font-bold text-lg">✨ Success! Audio Generated</h3>
                <a 
                  href={generatedAudio} 
                  download="cloned-voice.mp3"
                  className="text-sm bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-colors"
                >
                  Download
                </a>
              </div>
              <audio controls className="w-full h-10 rounded">
                <source src={generatedAudio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HomePage;