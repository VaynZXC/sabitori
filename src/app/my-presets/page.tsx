'use client';

export default function MyPresets() {
  // Плейсхолдер — позже fetch из БД
  const presets = [
    { name: 'Пресет 1', format: 'stories', effects: 'fade' },
    { name: 'Пресет 2', format: 'shorts', effects: 'zoom' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Мои пресеты</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {presets.map((preset, i) => (
          <div key={i} className="bg-profile p-6 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
            <h2 className="text-xl font-bold mb-2">{preset.name}</h2>
            <p className="text-lg">Формат: {preset.format}</p>
            <p className="text-lg">Эффекты: {preset.effects}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 rounded-md text-white text-lg transition-all duration-300 hover:bg-blue-600">Применить</button>
          </div>
        ))}
        {presets.length === 0 && <p className="text-center text-lg text-gray-400">Пока пресетов нет. Создайте новый!</p>}
      </div>
    </div>
  );
}