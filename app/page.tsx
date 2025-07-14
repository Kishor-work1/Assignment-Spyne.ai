"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Video,
  Clock,
  Type,
  Monitor,
  Smartphone,
  Upload,
  Star,
  Zap,
  Shield,
  Users,
} from "lucide-react";

// Framer Motion alternative using CSS animations
const motionClasses = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  slideDown: "animate-slide-down",
  bounce: "animate-bounce-gentle",
  scale: "animate-scale-in",
  float: "animate-float",
};

interface Caption {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

const VideoCaptionApp: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [newCaption, setNewCaption] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [activeCaption, setActiveCaption] = useState<Caption | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "auto">(
    "auto"
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [showHero, setShowHero] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // CSS animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounceGentle {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-5px); }
        60% { transform: translateY(-3px); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-fade-in { animation: fadeIn 0.6s ease-out; }
      .animate-slide-up { animation: slideUp 0.8s ease-out; }
      .animate-slide-down { animation: slideDown 0.8s ease-out; }
      .animate-bounce-gentle { animation: bounceGentle 0.8s ease-out; }
      .animate-scale-in { animation: scaleIn 0.5s ease-out; }
      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-gradient { animation: gradientShift 8s ease infinite; }
      .glass-effect {
        backdrop-filter: blur(20px);
        background: rgba(30, 41, 59, 0.3);
        border: 1px solid rgba(148, 163, 184, 0.1);
      }
      .glow-effect {
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Update current time and active caption
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      const currentTime = video.currentTime;
      setCurrentTime(currentTime);

      const active = captions.find(
        (caption) =>
          currentTime >= caption.startTime && currentTime <= caption.endTime
      );
      setActiveCaption(active || null);
    };

    const updateDuration = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("loadeddata", updateDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("loadeddata", updateDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [captions]);

  // Drag and drop functionality
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (!dropZone.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("video/")) {
          handleFileUpload(file);
        } else {
          alert("Please upload a video file");
        }
      }
    };

    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("drop", handleDrop);

    return () => {
      dropZone.removeEventListener("dragover", handleDragOver);
      dropZone.removeEventListener("dragleave", handleDragLeave);
      dropZone.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleFileUpload = (file: File) => {
    if (videoUrl && videoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(videoUrl);
    }

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setFileName(file.name);
    setCaptions([]);
    setCurrentTime(0);
    setIsPlaying(false);
    setActiveCaption(null);
    setDuration(0);
    setShowHero(false);
  };

  const handleVideoLoad = () => {
    const video = videoRef.current;
    if (video && video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing video:", error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const setCurrentTimeAsStart = () => {
    setStartTime(currentTime.toFixed(1));
  };

  const setCurrentTimeAsEnd = () => {
    setEndTime(currentTime.toFixed(1));
  };

  const addCaption = () => {
    if (!newCaption.trim() || !startTime || !endTime) return;

    const start = parseFloat(startTime);
    const end = parseFloat(endTime);

    if (start >= end) {
      alert("Start time must be less than end time");
      return;
    }

    const caption: Caption = {
      id: Date.now().toString(),
      text: newCaption.trim(),
      startTime: start,
      endTime: end,
    };

    setCaptions(
      [...captions, caption].sort((a, b) => a.startTime - b.startTime)
    );
    setNewCaption("");
    setStartTime("");
    setEndTime("");
    setShowForm(false);
  };

  const deleteCaption = (id: string) => {
    setCaptions(captions.filter((caption) => caption.id !== id));
  };

  const startEditing = (caption: Caption) => {
    setEditingId(caption.id);
    setEditText(caption.text);
  };

  const saveEdit = () => {
    if (!editingId || !editText.trim()) return;

    setCaptions(
      captions.map((caption) =>
        caption.id === editingId
          ? { ...caption, text: editText.trim() }
          : caption
      )
    );
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const jumpToCaption = (startTime: number) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = startTime;
      setCurrentTime(startTime);
    } catch (error) {
      console.error("Error jumping to caption:", error);
    }
  };

  const getVideoContainerStyle = () => {
    switch (aspectRatio) {
      case "16:9":
        return "aspect-video max-w-full";
      case "9:16":
        return "aspect-[9/16] max-w-sm mx-auto";
      default:
        return "max-h-[600px]";
    }
  };

  const getVideoStyle = () => {
    switch (aspectRatio) {
      case "16:9":
        return "w-full h-full object-cover";
      case "9:16":
        return "w-full h-full object-cover";
      default:
        return "w-full h-full max-h-[600px] object-contain";
    }
  };

  const FeatureCard = ({
    icon: Icon,
    title,
    description,
    delay = 0,
  }: {
    icon: any;
    title: string;
    description: string;
    delay?: number;
  }) => (
    <div
      className={`glass-effect rounded-2xl p-6 ${motionClasses.fadeIn} hover:glow-effect transition-all duration-300 transform hover:scale-105`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-slate-300 leading-relaxed">{description}</p>
    </div>
  );

  if (showHero) {
    return (
      <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-40 left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="container mx-auto px-4 py-6">
            <nav
              className={`flex items-center justify-between ${motionClasses.slideDown}`}
            >
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  CaptionStudio
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Features
                </a>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 transform hover:scale-105 cursor-pointer">
                  Get Started
                </button>
              </div>
            </nav>
          </header>

          {/* Hero Section */}
          <section className="container mx-auto px-4 py-20 text-center">
            <div className={`${motionClasses.fadeIn} max-w-4xl mx-auto`}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                Create Stunning Video Captions
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed">
                Transform your videos with professional captions. Easy to use,
                powerful features, and stunning results.
              </p>

              {/* Upload Drop Zone */}
              <div
                ref={dropZoneRef}
                className={`relative max-w-2xl mx-auto mb-16 ${motionClasses.slideUp}`}
              >
                <div
                  className={`glass-effect rounded-3xl p-12 border-2 border-dashed transition-all duration-300 ${
                    isDragging
                      ? "border-purple-400 glow-effect"
                      : "border-slate-600"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-6">
                    <div
                      className={`p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full ${motionClasses.bounce}`}
                    >
                      <Upload className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold mb-2">
                        Upload Your Video
                      </h3>
                      <p className="text-slate-400 mb-6">
                        Drag and drop your video file here, or click to browse
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 transform hover:scale-105 font-semibold text-lg cursor-pointer"
                      >
                        Choose Video File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileUpload(e.target.files[0])
                        }
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {/* <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 ${motionClasses.fadeIn}`}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">10k+</div>
                  <div className="text-slate-400">Videos Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">50+</div>
                  <div className="text-slate-400">Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
                  <div className="text-slate-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
                  <div className="text-slate-400">Support</div>
                </div>
              </div> */}
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="container mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${motionClasses.fadeIn}`}
              >
                Powerful Features
              </h2>
              <p
                className={`text-xl text-slate-300 max-w-2xl mx-auto ${motionClasses.fadeIn}`}
              >
                Everything you need to create professional video captions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Zap}
                title="Lightning Fast"
                description="Process videos in seconds with our optimized engine. No waiting, just results."
                delay={0.1}
              />
              <FeatureCard
                icon={Type}
                title="Smart Captions"
                description="AI-powered caption suggestions and auto-timing for perfect synchronization."
                delay={0.2}
              />
              <FeatureCard
                icon={Monitor}
                title="Multi-Format"
                description="Support for all video formats and aspect ratios. Perfect for any platform."
                delay={0.3}
              />
              <FeatureCard
                icon={Shield}
                title="Secure & Private"
                description="Your videos are processed securely and never stored on our servers."
                delay={0.4}
              />
              <FeatureCard
                icon={Users}
                title="Team Collaboration"
                description="Work together with your team on caption projects with real-time sync."
                delay={0.5}
              />
              <FeatureCard
                icon={Star}
                title="Export Options"
                description="Export to SRT, VTT, or burn captions directly into your video file."
                delay={0.6}
              />
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 py-20 text-center">
            <div
              className={`glass-effect rounded-3xl p-12 max-w-4xl mx-auto ${motionClasses.slideUp}`}
            >
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Join thousands of creators who trust CaptionStudio for their
                video captions.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                Upload Your First Video
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav
          className={`flex items-center justify-between ${motionClasses.slideDown}`}
        >
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Video className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CaptionStudio
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-slate-300">File: {fileName}</span>
            <button
              onClick={() => {
                setShowHero(true);
                setVideoUrl("");
                setFileName("");
                setCaptions([]);
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              New Project
            </button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 pb-8">
        {videoUrl && (
          <div
            className={`grid gap-6 ${
              aspectRatio === "9:16"
                ? "grid-cols-1"
                : "grid-cols-1 lg:grid-cols-3"
            } ${motionClasses.fadeIn}`}
          >
            {/* Video Player */}
            <div
              className={aspectRatio === "9:16" ? "mx-auto" : "lg:col-span-2"}
            >
              <div
                className={`glass-effect rounded-2xl p-6 h-fit flex flex-col ${motionClasses.slideUp}`}
              >
                {/* Aspect Ratio Controls */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="md:text-xl text-[0.8rem] font-semibold">
                    Video Preview
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Display:</span>
                    <div className="flex bg-slate-700 rounded-lg p-1">
                      <button
                        onClick={() => setAspectRatio("auto")}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          aspectRatio === "auto"
                            ? "bg-purple-600 text-white"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        Auto
                      </button>
                      <button
                        onClick={() => setAspectRatio("16:9")}
                        className={`px-3 py-1 rounded text-sm transition-all flex items-center space-x-1 ${
                          aspectRatio === "16:9"
                            ? "bg-purple-600 text-white"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        <span>16:9</span>
                      </button>
                      <button
                        onClick={() => setAspectRatio("9:16")}
                        className={`px-3 py-1 rounded text-sm transition-all flex items-center space-x-1 ${
                          aspectRatio === "9:16"
                            ? "bg-purple-600 text-white"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>9:16</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div
                    className={`relative w-full max-w-full sm:${getVideoContainerStyle()} mx-auto`}
                  >
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      onLoadedMetadata={handleVideoLoad}
                      onLoadedData={handleVideoLoad}
                      className="w-full h-auto max-h-[40vh] sm:max-h-[600px] object-contain rounded-lg"
                      preload="metadata"
                      controls={false}
                    />

                    {/* Caption Overlay */}
                    {activeCaption && (
                      <div
                        className={`absolute inset-0 flex items-end justify-center pb-8 pointer-events-none ${motionClasses.fadeIn}`}
                      >
                        <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-center max-w-[90vw] sm:max-w-[80%] mx-2 sm:mx-4 backdrop-blur-sm break-words">
                          <p className="text-base sm:text-lg font-medium leading-relaxed break-words">
                            {activeCaption.text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Controls */}
                <div className="mt-4 space-y-4 flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                            (currentTime / duration) * 100
                          }%, #475569 ${
                            (currentTime / duration) * 100
                          }%, #475569 100%)`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-slate-400 min-w-[80px]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption Controls */}
            <div
              className={`space-y-6 h-fit flex flex-col ${
                aspectRatio === "9:16" ? "mt-8" : "lg:h-[800px]"
              }`}
            >
              {/* Add Caption Form */}
              <div
                className={`glass-effect rounded-2xl p-6 flex-shrink-0 ${motionClasses.slideUp}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center space-x-2">
                    <Type className="w-5 h-5" />
                    <span>Add Caption</span>
                  </h3>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showForm && (
                  <div className={`space-y-4 ${motionClasses.fadeIn}`}>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Caption Text
                      </label>
                      <textarea
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        placeholder="Enter caption text..."
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none backdrop-blur-sm"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Start Time (seconds)
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="0.0"
                            step="0.1"
                            className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                          />
                          <button
                            onClick={setCurrentTimeAsStart}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 transform hover:scale-105"
                            title="Use current time"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          End Time (seconds)
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            placeholder="0.0"
                            step="0.1"
                            className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                          />
                          <button
                            onClick={setCurrentTimeAsEnd}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 transform hover:scale-105"
                            title="Use current time"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={addCaption}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      Add Caption
                    </button>
                  </div>
                )}
              </div>

              {/* Caption List */}
              <div
                className={`glass-effect rounded-2xl p-6 flex-1 flex flex-col min-h-0 ${motionClasses.slideUp}`}
              >
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 className="text-xl font-semibold">
                    Captions ({captions.length})
                  </h3>
                  {captions.length > 0 && (
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm">
                      Export SRT
                    </button>
                  )}
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {captions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-slate-700/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Type className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-400 text-lg mb-2">
                        No captions yet
                      </p>
                      <p className="text-slate-500 text-sm">
                        Start adding captions to see them here!
                      </p>
                    </div>
                  ) : (
                    captions.map((caption, index) => (
                      <div
                        key={caption.id}
                        className={`p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] ${
                          activeCaption?.id === caption.id
                            ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500 glow-effect"
                            : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
                        } ${motionClasses.fadeIn}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <button
                            onClick={() => jumpToCaption(caption.startTime)}
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
                          >
                            {formatTime(caption.startTime)} -{" "}
                            {formatTime(caption.endTime)}
                          </button>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditing(caption)}
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCaption(caption.id)}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {editingId === caption.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none backdrop-blur-sm"
                              rows={2}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={saveEdit}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-all duration-300 transform hover:scale-105"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-sm transition-all duration-300 transform hover:scale-105"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-200 leading-relaxed">
                            {caption.text}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default VideoCaptionApp;
