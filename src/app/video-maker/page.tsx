'use client';

import React, { useState } from 'react';

function throttle(func: (...args: any[]) => void, limit: number) {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export default function VideoMaker() {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // 0: Сценарий, 1: Озвучка, 2: Фон, 3: Субтитры, 4: Эффект, 5: Финал
  const [showCustomPrompt, setShowCustomPrompt] = useState(false); // Toggle для кастомного промпта
  // Состояние для Сценария (добавил loading и error)
  const [scenarioData, setScenarioData] = useState({
    model: 'gpt-4o-mini', // Изменил дефолт на gpt-4o-mini, как в твоём коде
    idea: '',
    prompt: '',
    scenario: '',
  });
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  // Состояние для Озвучки (добавлены gender и voiceName)
  const [voiceData, setVoiceData] = useState({
    model: 'elevenlabs',
    intonation: 'narrative',
    gender: 'male' as 'male' | 'female',
    voiceName: '',
    audioUrl: '' as string | null,
  });

  const [backgroundData, setBackgroundData] = useState({
      type: null as 'image' | 'video' | 'youtube' | null,
      source: 'generate', // generate или upload (для совместимости)
      backgroundType: null as 'ai' | 'custom' | null,
      customSource: null as 'upload' | 'youtube' | null,
      aiPrompt: '',
      url: '' as string | null,
      thumbnail: '' as string | null
    });

  const [hoverAi, setHoverAi] = useState(false);
  const [hoverCustom, setHoverCustom] = useState(false);

  const [selectedBackgroundType, setSelectedBackgroundType] = useState<string | null>(null); // null для выбора, 'ai' или 'custom'

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Расширенное состояние для Субтитров с новыми полями
  const [subtitlesData, setSubtitlesData] = useState({
    style: 'simple' as 'simple' | 'animated' | 'bold' | 'highlight',
    font: 'sans-serif' as 'sans-serif' | 'serif' | 'monospace' | 'cursive' | 'fantasy',
    textColor: '#ffffff',
    animationColor: '#a855f7', // Фиолетовый по умолчанию по референсу
    position: 'bottom' as 'top' | 'middle' | 'bottom',
    subtitlesText: '',
  });

  // Расширенное состояние для Эффектов
  const [effectData, setEffectData] = useState({
    selectedEffect: null as string | null,
    opacity: 1.0, // Прозрачность от 0 до 1
  });

  // Состояние для Финала
  const [finalData, setFinalData] = useState({
    previewUrl: '' as string | null,
    exported: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const steps = ['Сценарий', 'Озвучка', 'Фон', 'Субтитры', 'Эффект', 'Финал'];

  // Проверка возможности перейти вперёд
  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return scenarioData.scenario.trim() !== '';
      case 1:
        return voiceData.audioUrl !== null && voiceData.audioUrl !== '';
      case 2:
        return backgroundData.url !== null && backgroundData.url !== '';
      case 3:
        return subtitlesData.subtitlesText.trim() !== '';
      case 4:
        return effectData.selectedEffect !== null;
      case 5:
        return finalData.exported;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (canGoNext() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2 && selectedBackgroundType) {
      setSelectedBackgroundType(null); // Сброс выбора в фоне
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setSelectedFormat(null);
    }
  };

  // Обработчики для Сценария
  const handleScenarioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setScenarioData({ ...scenarioData, [e.target.name]: e.target.value });
  };

  const handleGenerateScenario = async () => {
    setIsGeneratingScenario(true);
    setScenarioError(null);
    try {
      let fullPrompt = scenarioData.idea;
      if (showCustomPrompt && scenarioData.prompt) {
        fullPrompt += `\n${scenarioData.prompt}`;
      }
      if (!fullPrompt.trim()) {
        throw new Error('Идея или промпт обязательны');
      }

      let response;
      const apiEndpoint = scenarioData.model.startsWith('grok') ? '/api/generate-scenario-grok' : '/api/generate-scenario-chatgpt';
      response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: scenarioData.model,
          max_tokens: 5000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка сервера');
      }

      const data = await response.json();
      setScenarioData({ ...scenarioData, scenario: data.scenario });
    } catch (err) {
      setScenarioError((err as Error).message || 'Неизвестная ошибка');
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  // Обработчики для Озвучки (обновлено для gender и voiceName)
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newData = { ...voiceData, [name]: value };

    // Сброс voiceName при смене модели, пола или интонации
    if (name === 'model' || name === 'gender' || name === 'intonation') {
      newData.voiceName = '';
    }

    setVoiceData(newData);
  };

  const handleGenerateVoice = async () => {
    if (!voiceData.voiceName) return; // Предотвращаем генерацию без голоса
    setIsGenerating(true);
    // Симуляция задержки для API (в реальности: await fetch(...))
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 секунды
    const audioUrl = '/audio/test.mp3'; // Для тестов; замени на реальный URL от API
    setVoiceData({ ...voiceData, audioUrl });
    setIsGenerating(false);
  };

  // Плейсхолдер для голосов (можно расширить по моделям)
  const getVoiceOptions = () => {
    const { model, gender } = voiceData;
    if (model === 'elevenlabs') {
      if (gender === 'male') {
        return ['Adam', 'Josh', 'Matthew'];
      } else {
        return ['Alice', 'Bella', 'Clara'];
      }
    } else if (model === 'google-tts') {
      if (gender === 'male') {
        return ['en-US-Wavenet-D', 'ru-RU-Wavenet-B'];
      } else {
        return ['en-US-Wavenet-F', 'ru-RU-Wavenet-A'];
      }
    } else if (model === 'amazon-polly') {
      if (gender === 'male') {
        return ['Matthew', 'Justin'];
      } else {
        return ['Joanna', 'Salli'];
      }
    }
    return [];
  };

  // Обработчики для Фона
  const handleBackgroundChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    setBackgroundData({ ...backgroundData, [e.target.name]: e.target.value });
  };

  const handleGenerateBackground = () => {
    // Симуляция генерации слайдшоу через ИИ
    const url = 'https://example.com/generated_slide_show.mp4'; // Placeholder для видео-слайдшоу
    setBackgroundData({ ...backgroundData, url });
  };

  const handleYoutubeLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    const youtubeUrl = e.target.value;
    if (youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be')) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (videoId) {
        setBackgroundData({ ...backgroundData, url: `https://www.youtube.com/embed/${videoId}`, type: 'youtube' });
      } else {
        alert('Неверный формат ссылки на YouTube!');
      }
    } else {
      alert('Неверная ссылка на YouTube!');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      let thumbnail = url;
      if (file.type.startsWith('video/')) {
        try {
          thumbnail = await generateVideoThumbnail(url);
        } catch (err) {
          console.error('Ошибка генерации thumbnail:', err);
          thumbnail = url;
        }
      }
      setBackgroundData({
        ...backgroundData,
        url,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        thumbnail,
      });
    }
  };

  const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous'; // Если нужно для canvas
      video.addEventListener('loadeddata', () => {
        video.currentTime = 0; // Первый кадр
      });
      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject('Не удалось создать canvas');
        }
      });
      video.addEventListener('error', reject);
      video.load();
    });
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      let thumbnail = url; // По умолчанию для изображений
      if (file.type.startsWith('video/')) {
        try {
          thumbnail = await generateVideoThumbnail(url);
        } catch (err) {
          console.error('Ошибка генерации thumbnail:', err);
          thumbnail = url; // Фоллбек на полное видео
        }
      }
      setBackgroundData({
        ...backgroundData,
        url, // Полный URL для рендеринга позже
        type: file.type.startsWith('video/') ? 'video' : 'image',
        thumbnail, // Новый ключ для превью
      });
    }
  };

  // Обработчики для Субтитров (расширенные)
  const handleSubtitlesChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'color' ? value : value;
    setSubtitlesData({ ...subtitlesData, [name]: newValue });
  };

  const handleGenerateSubtitles = () => {
    // Placeholder для генерации субтитров на основе сценария и озвучки
    // В реальности здесь будет API-запрос для синхронизации с аудио
    const generated = 'The light coming through the window illuminated the room, creating a warm and inviting atmosphere.'; // Тестовый текст, вдохновлённый референсом
    setSubtitlesData({ ...subtitlesData, subtitlesText: generated });
  };

  // Обработчики для Эффектов (новые)
  const handleEffectSelect = (effectName: string) => {
    setEffectData({ ...effectData, selectedEffect: effectName });
  };

  const handleOpacityChange = throttle((e: React.ChangeEvent<HTMLInputElement>) => {
    setEffectData({ ...effectData, opacity: parseFloat(e.target.value) });
  }, 1000); // 100мс задержка между обновлениями

  // Обработчики для Финала
  const handleGenerateFinal = () => {
    const previewUrl = 'https://example.com/final_video.mp4'; // Placeholder
    setFinalData({ ...finalData, previewUrl, exported: true });
  };

  // Улучшенный прогресс-бар с отступом
  const renderProgressBar = () => (
    <div className="flex items-center mb-12 relative">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center z-10 min-w-[2rem] relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 hover:scale-110 ${
                index < currentStep
                  ? 'bg-green-500 scale-105 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                  : index === currentStep
                  ? 'bg-blue-500 scale-105 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                  : 'bg-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <div className="absolute top-10 text-sm font-medium text-white text-center whitespace-nowrap font-roboto">
              {step}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-[-0.5rem] relative">
              <div className="w-full h-1 bg-gray-600 transition-all duration-300"></div>
              {index < currentStep && (
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-fill-progress"></div>
              )}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderScenarioStep = () => (
    <div className="space-y-6 w-full max-w-full shrink-0 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12">
        <div className="bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <label className="block text-base font-medium mb-2 font-roboto">Модель</label>
          <select
            name="model"
            value={scenarioData.model}
            onChange={handleScenarioChange}
            className="w-full bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500 transition-all"
          >
            <option value="gpt-4o">ChatGPT</option>
            <option value="claude">Claude</option> {/* Если Claude — добавь отдельный SDK позже */}
            <option value="grok-3-mini">Grok</option> {/* Добавили Grok */}
          </select>
          <label className="block text-base font-medium mt-4 mb-2 font-roboto">Идея</label>
          <textarea
            name="idea"
            value={scenarioData.idea}
            onChange={handleScenarioChange}
            className="w-full bg-gray-800 rounded-md p-3 text-base text-white italic placeholder:italic border border-gray-600 focus:border-blue-500"
            rows={3}
            placeholder="Опишите идею... Например: 'My wife left me after 30 years…'"
          />
          <div className="mt-4">
            <button
              onClick={() => setShowCustomPrompt(!showCustomPrompt)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-md text-white text-sm font-medium transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-sm"
            >
              {showCustomPrompt ? 'Скрыть промпт ▼' : 'Добавить промпт ▲'}
            </button>
            {showCustomPrompt && (
              <textarea
                name="prompt"
                value={scenarioData.prompt}
                onChange={handleScenarioChange}
                className="w-full bg-gray-800 rounded-md p-3 text-base text-white mt-2 italic placeholder:italic border border-gray-600 focus:border-blue-500"
                rows={3}
                placeholder="Ваш промпт... (добавится к идее)"
              />
            )}
          </div>
          <button
            onClick={handleGenerateScenario}
            disabled={isGeneratingScenario}
            className={`mt-4 px-6 py-3 rounded-md text-white text-base font-bold transition-all duration-300 ${isGeneratingScenario ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:scale-105'}`}
          >
            {isGeneratingScenario ? 'Генерирую...' : 'Генерировать'}
          </button>
          {scenarioError && <p className="mt-2 text-red-500 text-sm">{scenarioError}</p>}
        </div>
        <div className="bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <label className="block text-base font-medium mb-2 font-roboto">Сценарий</label>
          <textarea
            name="scenario"
            value={scenarioData.scenario}
            onChange={handleScenarioChange}
            className="w-full h-[400px] bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500"
            placeholder="Результат здесь... (можно редактировать вручную)"
          />
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevStep}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-md text-white text-base font-medium transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-sm"
        >
          Назад
        </button>
        <button
          onClick={handleNextStep}
          disabled={!canGoNext() || isGeneratingScenario}
          className={`px-6 py-3 rounded-md text-white text-base font-bold transition-all duration-300 shadow-sm ${canGoNext() && !isGeneratingScenario ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105' : 'bg-gray-500 cursor-not-allowed'}`}
        >
          Далее
        </button>
      </div>
    </div>
  );

  const renderVoiceStep = () => (
    <div className="space-y-6 w-full max-w-full shrink-0 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 md:gap-12">
          <div className="bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg flex flex-col">
            <label className="block text-base font-medium mb-2 font-roboto">Сценарий</label>
            <div className={`transition-all duration-500 ease-in-out ${isGenerating || voiceData.audioUrl ? 'h-[300px]' : 'h-[400px]'} overflow-hidden`}>
              <textarea
                value={scenarioData.scenario}
                className="w-full h-full bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600"
                readOnly
              />
            </div>
            <div className="mt-4 transition-opacity duration-300 opacity-100">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-32 bg-gray-800 rounded-lg shadow-inner animate-pulse">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm font-medium text-blue-400 animate-bounce">Генерация озвучки...</p>
                </div>
              ) : voiceData.audioUrl ? (
                <CustomAudioPlayer src={voiceData.audioUrl} />
              ) : (
                <p className="text-center text-sm font-normal text-gray-400">Озвучка не готова. Сгенерируйте её.</p>
              )}
            </div>
          </div>

          <div className="bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <label className="block text-base font-medium mb-2 font-roboto">Модель озвучки</label>
            <select
              name="model"
              value={voiceData.model}
              onChange={handleVoiceChange}
              className="w-full bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500"
            >
              <option value="elevenlabs">ElevenLabs</option>
              <option value="google-tts">Google TTS</option>
              <option value="amazon-polly">Amazon Polly</option>
            </select>

            <label className="block text-base font-medium mt-4 mb-2 font-roboto">Пол голоса</label>
            <select
              name="gender"
              value={voiceData.gender}
              onChange={handleVoiceChange}
              className="w-full bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500"
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>

            <label className="block text-base font-medium mt-4 mb-2 font-roboto">Интонация</label>
            <select
              name="intonation"
              value={voiceData.intonation}
              onChange={handleVoiceChange}
              className="w-full bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500"
            >
              <option value="narrative">Повествование</option>
              <option value="energetic">Энергичная</option>
              <option value="calm">Спокойная</option>
              <option value="universal">Универсальная</option>
            </select>

            <label className="block text-base font-medium mt-4 mb-2 font-roboto">Голос</label>
            <select
              name="voiceName"
              value={voiceData.voiceName}
              onChange={handleVoiceChange}
              className="w-full bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500"
              disabled={!voiceData.gender}
            >
              <option value="">Выберите голос...</option>
              {getVoiceOptions().map((voice) => (
                <option key={voice} value={voice}>
                  {voice}
                </option>
              ))}
            </select>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGenerateVoice}
                disabled={!voiceData.voiceName || isGenerating}
                className={`px-6 py-3 rounded-md text-white text-base font-bold transition-all duration-300 ${voiceData.voiceName && !isGenerating ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:scale-105' : 'bg-gray-500 cursor-not-allowed'}`}
              >
                {isGenerating ? 'Генерирую...' : 'Генерировать'}
              </button>
            </div>
          </div>
        </div>

      <div className="flex justify-between mt-6">
        <button 
          onClick={handlePrevStep}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-md text-white text-base font-medium transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-sm"
        >
          Назад
        </button>
        <button 
          onClick={handleNextStep}
          disabled={!canGoNext()}
          className={`px-6 py-3 rounded-md text-white text-base font-bold transition-all duration-300 shadow-sm ${canGoNext() ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105' : 'bg-gray-500 cursor-not-allowed'}`}
        >
          Далее
        </button>
      </div>
    </div>
  );

  const renderBackgroundStep = () => (
  <div className="space-y-6 w-full max-w-full shrink-0 px-4">
    <div className="flex items-center justify-center min-h-[510px]"> {/* Полный экран для выбора/настроек */}
      {!selectedBackgroundType ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-[1000px] max-w-2xl overflow-visible relative mt-[300px]">
          {/* Кнопка "Создать с помощью ИИ" */}
          <div
            className="group relative cursor-pointer rounded-xl shadow-xl min-w-[350px] transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center font-bold text-lg overflow-visible z-10"
            onClick={() => setSelectedBackgroundType('ai')}
            onMouseEnter={() => setHoverAi(true)}
            onMouseLeave={() => setHoverAi(false)}
          >
            Создать фон через ИИ
            <div
              className={`absolute z-50 top-[-270px] left-1/2 transform -translate-x-1/2 w-[500px] aspect-[16/9] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-gradient-to-r from-gray-400 to-gray-600 transition-all duration-200 ease-in-out ${
                hoverAi ? 'opacity-100 scale-105 -translate-y-4 blur-0 popup-appear' : 'opacity-0 scale-90 translate-y-0 blur-sm popup-disappear'
              }`}
            >
              <video
                src="/videos/preview/preview1.mp4"
                autoPlay
                loop
                muted
                preload="auto" // Улучшенная загрузка
                className="w-full h-full object-cover rounded-2xl transition-transform duration-200 ease-in-out group-hover:scale-110"
              />
            </div>
          </div>

          {/* Кнопка "Использовать свой фон" */}
          <div
            className="group relative cursor-pointer rounded-xl shadow-xl min-w-[350px] transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-center font-bold text-lg overflow-visible z-10"
            onClick={() => setSelectedBackgroundType('custom')}
            onMouseEnter={() => setHoverCustom(true)}
            onMouseLeave={() => setHoverCustom(false)}
          >
            Использовать свой фон
            <div
              className={`absolute z-50 top-[-270px] left-1/2 transform -translate-x-1/2 w-[500px] aspect-[16/9] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-gradient-to-r from-gray-400 to-gray-600 transition-all duration-200 ease-in-out ${
                hoverCustom ? 'opacity-100 scale-105 -translate-y-4 blur-0 popup-appear' : 'opacity-0 scale-90 translate-y-0 blur-sm popup-disappear'
              }`}
            >
              <video
                src="/videos/preview/preview2.mp4"
                autoPlay
                loop
                muted
                preload="auto" // Улучшенная загрузка
                className="w-full h-full object-cover rounded-2xl transition-transform duration-200 ease-in-out group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl transition-transform duration-500 ease-in-out">
          <button 
            onClick={() => setSelectedBackgroundType(null)}
            className="mb-4 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-md text-white text-sm font-medium transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-sm"
          >
            Назад к выбору
          </button>

          {selectedBackgroundType === 'ai' ? (
            <div className="bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
              <label className="block text-base font-medium mb-2 font-roboto">Промпт для ИИ (описание слайдшоу)</label>
              <textarea
                name="aiPrompt"
                value={backgroundData.aiPrompt}
                onChange={handleBackgroundChange}
                className="w-full bg-gray-800 rounded-md p-3 text-base text-white italic placeholder:italic border border-gray-600 focus:border-blue-500 transition-all duration-300 hover:shadow-[0_0_5px_rgba(59,130,246,0.3)]"
                rows={4}
                placeholder="Опишите фон для слайдшоу... Например: 'Космический пейзаж с звёздами и планетами'"
              />

              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => setBackgroundData({ ...backgroundData, aiPrompt: '' })}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-md text-white text-sm font-medium transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-sm"
                >
                  Очистить
                </button>
                <button
                  onClick={handleGenerateBackground}
                  disabled={!backgroundData.aiPrompt.trim()}
                  className={`px-6 py-3 rounded-md text-white text-base font-bold transition-all duration-300 ${backgroundData.aiPrompt.trim() ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:scale-105' : 'bg-gray-500 cursor-not-allowed'}`}
                >
                  Генерировать слайдшоу
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
              {/* Левая панель: меню с опциями */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2 font-roboto">Выберите источник</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setBackgroundData({ ...backgroundData, customSource: 'upload' })}
                      className={`w-full px-4 py-3 text-left rounded-md transition-all duration-300 shadow-sm flex items-center space-x-3 ${
                        backgroundData.customSource === 'upload'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:scale-102'
                      }`}
                      aria-label="Загрузить с компьютера"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>Загрузить с компьютера</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setBackgroundData({ ...backgroundData, customSource: 'youtube' })}
                      className={`w-full px-4 py-3 text-left rounded-md transition-all duration-300 shadow-sm flex items-center space-x-3 ${
                        backgroundData.customSource === 'youtube'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:scale-102'
                      }`}
                      aria-label="Видео с YouTube"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                      </svg>
                      <span>Видео с YouTube</span>
                    </button>
                  </li>
                </ul>
                {/* Пояснение для выбранного (общее, но можно расширить) */}
                <p className="text-sm text-gray-400 mt-4 italic">
                  Файлы обрабатываются локально. Для больших видео рендеринг запустится в приложении.
                </p>
              </div>

              {/* Правая панель: контент в зависимости от выбора */}
              <div className="bg-gray-800 rounded-lg p-6 transition-all duration-300">
                {!backgroundData.customSource ? (
                  <p className="text-center text-gray-400 text-base font-medium">Выберите источник слева, чтобы продолжить.</p>
                ) : backgroundData.customSource === 'upload' ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
                      isDragging
                        ? 'border-blue-500 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-102'
                        : 'border-gray-500 hover:border-blue-400 hover:bg-blue-900/5 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Зона для перетаскивания файла"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 mb-4 transition-colors duration-300 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-base text-white font-medium mb-2">Перетащите файл сюда или кликните для выбора</p>
                    <p className="text-sm text-gray-400 italic">Поддержка изображений и видео (до 100 МБ, обработка локально).</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleUploadBackground}
                      className="hidden"
                      accept="image/*,video/*"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-base font-medium mb-2 text-white font-roboto">Ссылка на YouTube</label>
                    <input
                      type="text"
                      name="youtubeUrl"
                      onChange={handleYoutubeLink}
                      className="w-full bg-gray-700 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500 transition-all duration-300 hover:shadow-[0_0_5px_rgba(59,130,246,0.3)] placeholder:italic"
                      placeholder="Вставьте ссылку: https://youtu.be/example"
                    />
                    <p className="mt-3 text-sm text-gray-300 italic">
                      Видео будет скачено в определённую папку приложения после начала рендеринга самого видео, потом видео можно спокойно удалить при желании. Убедитесь, что видео публичное.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {backgroundData.url && (
            <div className="mt-6 bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
              <p className="text-base font-medium font-roboto mb-2">Предпросмотр фона:</p>
              {backgroundData.type === 'youtube' ? (
                <iframe
                  src={backgroundData.url}
                  className="w-full h-64 rounded-md transition-all duration-300 hover:scale-105"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : backgroundData.type === 'image' ? (
                <img src={backgroundData.url} alt="Фон" className="w-full h-64 object-cover rounded-md transition-all duration-300 hover:scale-105" />
              ) : backgroundData.thumbnail ? ( // Для видео — thumbnail
                <img src={backgroundData.thumbnail} alt="Превью видео" className="w-full h-64 object-cover rounded-md transition-all duration-300 hover:scale-105" />
              ) : (
                <video src={backgroundData.url} controls className="w-full h-64 rounded-md transition-all duration-300 hover:scale-105" />
              )}
              <div className="mt-4 flex justify-between">
                <a href={backgroundData.url} download className="text-blue-400 hover:underline text-sm font-normal transition-all duration-300 hover:text-blue-300">Скачать</a>
                <button
                  onClick={() => setBackgroundData({ ...backgroundData, url: null, type: null, thumbnail: null })}
                  className="text-red-400 hover:underline text-sm font-normal transition-all duration-300 hover:text-red-300"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    <div className="flex justify-between mt-6">
      <button 
        onClick={handlePrevStep}
        className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-md text-white text-base font-medium transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-sm"
      >
        Назад
      </button>
      <button 
        onClick={handleNextStep}
        disabled={!canGoNext()}
        className={`px-6 py-3 rounded-md text-white text-base font-bold transition-all duration-300 shadow-sm ${canGoNext() ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105' : 'bg-gray-500 cursor-not-allowed'}`}
      >
        Далее
      </button>
    </div>
  </div>
);

  // Полностью переписанный renderSubtitlesStep с новым дизайном
  const renderSubtitlesStep = () => (
    <div className="space-y-6 w-full max-w-full shrink-0 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12">
        {/* Левая часть: Настройки субтитров */}
        <div className="bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 font-roboto">Настройки субтитров</h3>

          {/* Стиль */}
          <div>
            <label className="block text-base font-medium mb-2 text-gray-300 font-roboto">Стиль</label>
            <select
              name="style"
              value={subtitlesData.style}
              onChange={handleSubtitlesChange}
              className="w-full bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500 transition-all duration-300 hover:shadow-[0_0_5px_rgba(59,130,246,0.3)]"
            >
              <option value="simple">Простой (стандартный текст)</option>
              <option value="animated">Анимированный (появление по словам)</option>
              <option value="bold">Жирный (с жирным шрифтом)</option>
              <option value="highlight">Выделенный (с цветным блоком, как в референсе)</option>
            </select>
            <p className="mt-1 text-sm text-gray-400 italic">Выберите стиль для отображения субтитров в видео.</p>
          </div>

          {/* Шрифт */}
          <div>
            <label className="block text-base font-medium mb-2 text-gray-300 font-roboto">Шрифт</label>
            <select
              name="font"
              value={subtitlesData.font}
              onChange={handleSubtitlesChange}
              className="w-full bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500 transition-all duration-300 hover:shadow-[0_0_5px_rgba(59,130,246,0.3)]"
            >
              <option value="sans-serif">Sans-serif (без засечек, современный)</option>
              <option value="serif">Serif (с засечками, классический)</option>
              <option value="monospace">Monospace (моноширинный, кодовый)</option>
              <option value="cursive">Cursive (рукописный)</option>
              <option value="fantasy">Fantasy (декоративный)</option>
            </select>
            <p className="mt-1 text-sm text-gray-400 italic">Шрифт влияет на читаемость и эстетику.</p>
          </div>

          {/* Цвет текста */}
          <div>
            <label className="block text-base font-medium mb-2 text-gray-300 font-roboto">Цвет текста</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                name="textColor"
                value={subtitlesData.textColor}
                onChange={handleSubtitlesChange}
                className="w-12 h-12 rounded-md border border-gray-600 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
              <span className="text-sm text-gray-300">{subtitlesData.textColor.toUpperCase()}</span>
            </div>
            <p className="mt-1 text-sm text-gray-400 italic">Основной цвет для текста субтитров.</p>
          </div>

          {/* Цвет анимации/выделения */}
          <div>
            <label className="block text-base font-medium mb-2 text-gray-300 font-roboto">Цвет анимации/выделения</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                name="animationColor"
                value={subtitlesData.animationColor}
                onChange={handleSubtitlesChange}
                className="w-12 h-12 rounded-md border border-gray-600 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
              <span className="text-sm text-gray-300">{subtitlesData.animationColor.toUpperCase()}</span>
            </div>
            <p className="mt-1 text-sm text-gray-400 italic">Цвет для анимаций или выделения, как фиолетовый блок в референсе.</p>
          </div>

          {/* Позиционирование */}
          <div>
            <label className="block text-base font-medium mb-2 text-gray-300 font-roboto">Позиционирование</label>
            <select 
              name="position"
              value={subtitlesData.position}
              onChange={handleSubtitlesChange}
              className="w-full bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500 transition-all duration-300 hover:shadow-[0_0_5px_rgba(59,130,246,0.3)]"
            >
              <option value="top">Сверху</option>
              <option value="middle">Посередине</option>
              <option value="bottom">Снизу</option>
            </select>
            <p className="mt-1 text-sm text-gray-400 italic">Где разместить субтитры на экране.</p>
          </div>

          {/* Кнопка генерации */}
          <button
            onClick={handleGenerateSubtitles}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md text-white text-base font-bold transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:scale-105 active:scale-95"
          >
            Установить свой текст
          </button>
        </div>

        {/* Правая часть: Превью с наложенными субтитрами */}
        <div className="bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 font-roboto">Предпросмотр субтитров</h3>
          <div className="relative w-full aspect-[16/9] bg-cover bg-center rounded-lg overflow-hidden shadow-inner transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
               style={{ backgroundImage: "url('/formats/story.jpg')" }}>
            {/* Наложение субтитров */}
            <div
              className={`absolute inset-0 flex items-center justify-center px-8 py-4 text-center transition-all duration-500 ${
                subtitlesData.position === 'top' ? 'items-start pt-8' : 
                subtitlesData.position === 'middle' ? 'items-center' : 
                'items-end pb-8'
              }`}
            >
              <p
                className={`text-3xl font-bold uppercase leading-tight tracking-wide shadow-text transition-all duration-300 ${
                  subtitlesData.style === 'bold' ? 'font-extrabold' :
                  subtitlesData.style === 'animated' ? 'animate-word-by-word' :
                  subtitlesData.style === 'highlight' ? 'highlight-text' : ''
                }`}
                style={{
                  fontFamily: subtitlesData.font,
                  color: subtitlesData.textColor,
                }}
              >
                {subtitlesData.subtitlesText || 'Пример субтитров: The light coming through the'}
                {subtitlesData.style === 'highlight' && (
                  <span
                    className="inline-block mx-1 px-2 py-1 rounded-md text-white transition-colors duration-300"
                    style={{ backgroundColor: subtitlesData.animationColor }}
                  >
                    coming through
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Редактируемый текст субтитров под превью */}
          {subtitlesData.subtitlesText && (
            <div className="mt-6">
              <label className="block text-base font-medium mb-2 text-gray-300 font-roboto">Редактировать текст субтитров</label>
              <textarea
                name="subtitlesText"
                value={subtitlesData.subtitlesText}
                onChange={handleSubtitlesChange}
                className="w-full h-32 bg-gray-800 rounded-md p-3 text-base text-white border border-gray-600 focus:border-blue-500 transition-all duration-300 hover:shadow-[0_0_5px_rgba(59,130,246,0.3)]"
                placeholder="Сгенерированные субтитры появятся здесь..."
              />
              <p className="mt-2 text-sm text-gray-400 italic">Вы можете вручную отредактировать текст для точной подгонки под озвучку.</p>
            </div>
          )}

          {/* Информация о статусе */}
          {!subtitlesData.subtitlesText && (
            <p className="mt-4 text-center text-gray-400 text-sm font-normal italic">Видео фрагмент который вы сейчас видите использутся в качетве макета. В рендере будет задействован ролик который вы загрузили ранее. Нажмите "Установить свой текст", чтобы увидеть превью с своим текстом. Субтитры будут синхронизированы с озвучкой в финальном видео.</p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button 
          onClick={handlePrevStep}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-md text-white text-base font-medium transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-sm"
        >
          Назад
        </button>
        <button 
          onClick={handleNextStep}
          disabled={!canGoNext()}
          className={`px-6 py-3 rounded-md text-white text-base font-bold transition-all duration-300 shadow-sm ${canGoNext() ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105' : 'bg-gray-500 cursor-not-allowed'}`}
        >
          Далее
        </button>
      </div>
    </div>
  );

  // Полностью переписанный renderEffectStep с новым дизайном
  const renderEffectStep = () => {
        // Список 9 эффектов с плейсхолдерами видео (замените на реальные пути)
    const effects = [
      { name: 'fade', video: '/effects/vintage.mp4' },
      { name: 'slide', video: '/effects/vintage.mp4' },
      { name: 'zoom', video: '/effects/vintage.mp4' },
      { name: 'pan', video: '/effects/vintage.mp4' },
      { name: 'blur', video: '/effects/vintage.mp4' },
    ];
    const EffectGallery = () => {
      // Ссылки на видео для ховера
      const videoRefs = React.useRef<(HTMLVideoElement | null)[]>(new Array(effects.length).fill(null));

      const handleMouseEnter = (index: number) => {
        const video = videoRefs.current[index];
        if (video) {
          video.play();
        }
      };

      const handleMouseLeave = (index: number) => {
        const video = videoRefs.current[index];
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      };

      return (
        <div className="bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 font-roboto text-center">Выберите эффект</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-6">
            {effects.map((effect, index) => (
              <div
                key={effect.name}
                className={`relative aspect-[16/9] cursor-pointer rounded-lg overflow-hidden shadow-md transition-all duration-300 ${
                  effectData.selectedEffect === effect.name 
                    ? 'scale-105 border-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                    : 'hover:scale-105 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                }`}
                onClick={() => handleEffectSelect(effect.name)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={effect.video}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  preload="auto"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-center">
                  <span className="text-white text-sm font-medium capitalize">{effect.name}</span>
                </div>
              </div>
            ))}
            <div
              className="relative aspect-[16/9] cursor-pointer rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] flex items-center justify-center bg-gray-800"
              onClick={() => alert('Функция добавления своего эффекта (TODO: форма загрузки видео)') }
            >
              <span className="text-6xl text-blue-500 font-bold">+</span>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-center">
                <span className="text-white text-sm font-medium">Добавить свой</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-gray-400 text-sm font-normal italic">Наведите на эффект, чтобы увидеть превью видео. Выберите, чтобы применить к центральному просмотру.</p>
        </div>
      );
    };

    return (
      <div className="space-y-6 w-full max-w-full shrink-0 px-4">
        <div className="bg-[#141722] rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 font-roboto text-center">Предпросмотр эффекта</h3>
          {/* Центральное превью (чуть больше, по центру) */}
                    {/* Центральное превью: фон остается, эффект накладывается поверх */}
          <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] rounded-lg overflow-hidden shadow-inner transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            {/* Фон (оставляем оригинальный, как в субтитрах) */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/formats/story.jpg')" }} // Или используй backgroundData.url, если фон динамический
            />
            {/* Накладываем эффект как слой с screen blend */}
            {effectData.selectedEffect && (
              <video
                src={effects.find(e => e.name === effectData.selectedEffect)?.video}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                autoPlay
                muted
                style={{ mixBlendMode: 'screen', opacity: effectData.opacity }}
              />
            )}
            {/* Наложение субтитров поверх всего */}
            <div
              className={`absolute inset-0 flex items-center justify-center px-8 py-4 text-center transition-all duration-500 ${
                subtitlesData.position === 'top' ? 'items-start pt-8' : 
                subtitlesData.position === 'middle' ? 'items-center' : 
                'items-end pb-8'
              }`}
            >
              <p
                className={`text-4xl font-bold uppercase leading-tight tracking-wide shadow-text transition-all duration-300 ${
                  subtitlesData.style === 'bold' ? 'font-extrabold' :
                  subtitlesData.style === 'animated' ? 'animate-word-by-word' :
                  subtitlesData.style === 'highlight' ? 'highlight-text' : ''
                }`}
                style={{
                  fontFamily: subtitlesData.font,
                  color: subtitlesData.textColor,
                }}
              >
                {subtitlesData.subtitlesText || 'Пример субтитров: The light coming through the'}
                {subtitlesData.style === 'highlight' && (
                  <span
                    className="inline-block mx-1 px-2 py-1 rounded-md text-white transition-colors duration-300"
                    style={{ backgroundColor: subtitlesData.animationColor }}
                  >
                    coming through
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Настройки прозрачности */}
          <label className="block text-base font-medium mb-2 text-gray-300 font-roboto">Прозрачность эффекта</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"  // Теперь шаги по 10% (0.1)
              value={effectData.opacity}
              onChange={handleOpacityChange}
              className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer transition-all duration-300 hover:bg-gray-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${effectData.opacity * 100}%, #4b5563 ${effectData.opacity * 100}%)`,
              }}
            />
            {/* Добавляем кликабельные метки с процентами */}
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(val => (
                <button
                  key={val}
                  onClick={() => setEffectData({ ...effectData, opacity: val })}
                  className={`hover:text-blue-400 transition-colors duration-300 ${effectData.opacity === val ? 'text-blue-500 font-bold' : ''}`}
                >
                  {Math.round(val * 100)}%
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-400 italic">Регулируйте прозрачность выбранного эффекта (0% - полностью прозрачный, 100% - непрозрачный). Кликните на процент для точной установки.</p>
        </div>

        <EffectGallery />

        <div className="flex justify-between mt-6">
          <button 
            onClick={handlePrevStep}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-md text-white text-base font-medium transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-sm"
          >
            Назад
          </button>
          <button 
            onClick={handleNextStep}
            disabled={!canGoNext()}
            className={`px-6 py-3 rounded-md text-white text-base font-bold transition-all duration-300 shadow-sm ${canGoNext() ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105' : 'bg-gray-500 cursor-not-allowed'}`}
          >
            Далее
          </button>
        </div>
      </div>
    );
  };

  const renderFinalStep = () => (
    <div className="space-y-6 w-full max-w-full shrink-0 px-4">
      <h3 className="text-xl font-bold font-roboto">Финал</h3>
      <div className="text-center">
        <button
          onClick={handleGenerateFinal}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md text-white text-base font-bold transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:scale-105"
        >
          Сгенерировать видео
        </button>
      </div>

      {finalData.previewUrl && (
        <div className="mt-4">
          <label className="block text-base font-medium mb-2 font-roboto">Предпросмотр</label>
          <video src={finalData.previewUrl} controls className="w-full h-64 mx-auto" />
          <a href={finalData.previewUrl} download="video.mp4" className="block mt-2 text-blue-400 hover:underline text-sm font-normal text-center">Скачать</a>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button 
          onClick={handlePrevStep}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-md text-white text-base font-medium transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-sm"
        >
          Назад
        </button>
        <button 
          onClick={() => alert('Загружено на YouTube!')}
          disabled={!finalData.exported}
          className={`px-6 py-3 rounded-md text-white text-base font-bold transition-all duration-300 shadow-sm ${finalData.exported ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105' : 'bg-gray-500 cursor-not-allowed'}`}
        >
          На YouTube
        </button>
      </div>
    </div>
  );

  const CustomAudioPlayer = ({ src }: { src: string }) => {
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(false);

    React.useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const updateProgress = () => {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      };

      const setAudioDuration = () => setDuration(audio.duration);

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', setAudioDuration);
      audio.addEventListener('ended', () => setIsPlaying(false));

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', setAudioDuration);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }, []);

    React.useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
      }
    }, [volume, isMuted]);

    const togglePlay = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (audioRef.current) {
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        audioRef.current.currentTime = newTime;
        setProgress(parseFloat(e.target.value));
      }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseFloat(e.target.value));
      setIsMuted(false);
    };

    const toggleMute = () => {
      setIsMuted(!isMuted);
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    

    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
        <audio ref={audioRef} src={src} preload="metadata" />
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={togglePlay}
            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white shadow-md transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
          <div className="flex-1 mx-4">
            <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute top-0 left-0 h-full w-full opacity-30 animate-wave bg-gradient-to-r from-transparent via-blue-300 to-transparent" /> {/* Волна сохранена */}
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="absolute top-0 left-0 w-full h-full bg-transparent appearance-none cursor-pointer" // Absolute поверх бара, без mt
                style={{
                  background: 'transparent',
                }}
              />
            </div>
          </div>
          <div className="text-sm font-normal text-gray-300 transition-opacity duration-300 hover:opacity-100 opacity-80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={toggleMute}
            className="p-2 text-white transition-all duration-300 hover:scale-110"
          >
            {isMuted || volume === 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
          <div className="flex-1 mx-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer transition-all duration-300 hover:bg-gray-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${volume * 100}%, #4b5563 ${volume * 100}%)`,
              }}
            />
          </div>
          <a
            href={src}
            download="ozvuchka.mp3"
            className="p-2 text-blue-400 hover:text-blue-300 transition-all duration-300 hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-full overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-8 text-center font-roboto">Фабрика видео</h1>

      {!selectedFormat ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="grid grid-cols-1 gap-6">
            <div
              className="relative w-[480px] h-[270px] cursor-pointer rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_20px_rgba(59,130,246,0.5)]"
              onClick={() => setSelectedFormat('stories')}
            >
              <img
                src="/formats/story.jpg"
                alt="Обложка Историй"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h2 className="text-2xl font-bold text-white font-roboto">Истории</h2>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#181e30] p-8 rounded-xl shadow-md shadow-[0_0_10px_rgba(234,179,8,0.3)] max-w-full">
          <h2 className="text-2xl font-bold mb-4 font-roboto">Формат: {selectedFormat === 'stories' ? 'Истории' : ''}</h2>
          {renderProgressBar()}
          {currentStep === 0 && renderScenarioStep()}
          {currentStep === 1 && renderVoiceStep()}
          {currentStep === 2 && renderBackgroundStep()}
          {currentStep === 3 && renderSubtitlesStep()}
          {currentStep === 4 && renderEffectStep()}
          {currentStep === 5 && renderFinalStep()}
        </div>
      )}
    </div>
  );
}