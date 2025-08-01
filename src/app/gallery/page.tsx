'use client';

export default function Gallery() {
  // Плейсхолдер — позже fetch пресетов от пользователей
  const items = [
    { name: 'Пресет от пользователя 1', price: 10, image: '/preset1.png' },
    { name: 'Пресет от пользователя 2', price: 15, image: '/preset2.png' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Галерея</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <div key={i} className="bg-profile p-6 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
            <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-md mb-4" />  {/* Плейсхолдер изображения */}
            <h2 className="text-xl font-bold mb-2">{item.name}</h2>
            <p className="text-lg">Цена: {item.price}$</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 rounded-md text-white text-lg transition-all duration-300 hover:bg-blue-600">Купить</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-lg text-gray-400">Пока ничего нет в галерее.</p>}
      </div>
    </div>
  );
}