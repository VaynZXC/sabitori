'use client';

export default function Plans() {
  const plans = [
    { name: 'Free', price: 0, features: ['Ограниченные видео', 'Базовые пресеты'] },
    { name: 'Base', price: 99, features: ['Неограниченные видео', 'Доступ к маркетплейсу'] },
    { name: 'Pro', price: 299, features: ['Всё из Base', 'Приоритетная генерация', 'YouTube интеграция'] },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Планы</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div key={i} className="bg-profile p-6 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <p className="text-2xl font-bold mb-4">{plan.price}$ / месяц</p>
            <ul className="space-y-2 mb-4">
              {plan.features.map((feature, j) => <li key={j} className="text-lg"> - {feature}</li>)}
            </ul>
            <button className="w-full px-4 py-2 bg-blue-500 rounded-md text-white text-lg transition-all duration-300 hover:bg-blue-600">Подписаться</button>
          </div>
        ))}
      </div>
    </div>
  );
}