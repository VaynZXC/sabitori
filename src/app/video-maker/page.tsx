'use client';

import { useState } from 'react';

export default function VideoMaker() {
  const [formData, setFormData] = useState({
    format: 'stories',
    scenario: '',
    voice: 'male',
    background: '',
    effects: 'none',
    subtitlesFont: 'Arial',
    subtitlesAnimation: 'fade-in',
  });

  const handleChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Отправка в фоновое app — пока плейсхолдер
    alert('Видео генерируется! Параметры: ' + JSON.stringify(formData));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Фабрика видео</h1>
      <div className="bg-profile p-8 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-bold">Формат видео</label>
            <select name="format" value={formData.format} onChange={handleChange} className="mt-1 block w-full bg-gray-700 rounded-md p-2 text-lg">
              <option value="stories">Истории</option>
              <option value="shorts">Shorts</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-bold">Сценарий</label>
            <textarea name="scenario" value={formData.scenario} onChange={handleChange} className="mt-1 block w-full bg-gray-700 rounded-md p-2 text-lg" rows={4} />
          </div>
          {/* Добавь другие поля аналогично: озвучка, фон (input type="file"), эффекты */}
          <button type="submit" className="w-full px-4 py-3 bg-blue-500 rounded-md text-white text-lg font-bold transition-all duration-300 hover:bg-blue-600">Создать видео</button>
        </form>
      </div>
    </div>
  );
}