import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Search, Heart, Shield, ArrowRight, PawPrint } from 'lucide-react';
import PetCard from '../components/PetCard';
import type { Pet } from '../lib/types';

export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('pets')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setFeatured((data as Pet[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
                <PawPrint className="w-4 h-4" />
                Найди лучшего друга
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Каждый питомец
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                  заслуживает дом
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
                Помогаем бездомным животным найти любящих хозяев. Тысячи питомцев ждут именно тебя. Начни поиск прямо сейчас!
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/pets"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  <Search className="w-5 h-5" />
                  Найти питомца
                </Link>
                <Link
                  to={user ? "/join" : "/login"}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-orange-200 text-orange-600 font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all"
                >
                  Присоединиться
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-200 to-orange-300 rounded-3xl blur-2xl opacity-40" />
                <img
                  src="https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Happy dog"
                  className="relative rounded-3xl shadow-2xl w-full object-cover h-[420px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Питомцев нашли дом' },
              { value: '200+', label: 'Волонтёров' },
              { value: '12', label: 'Городов' },
              { value: '99%', label: 'Счастливых семей' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-white to-orange-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Как это работает?</h2>
            <p className="mt-3 text-gray-500">Три простых шага к новому другу</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Поиск', desc: 'Используйте фильтры для поиска питомца по виду, породе, возрасту и местоположению.' },
              { icon: Heart, title: 'Выбор', desc: 'Изучите профиль питомца, узнайте его характер и потребности.' },
              { icon: Shield, title: 'Усыновление', desc: 'Свяжитесь с приютом и начните процесс усыновления.' },
            ].map((step) => (
              <div key={step.title} className="bg-white rounded-2xl p-8 shadow-sm border border-orange-50 hover:shadow-lg hover:shadow-orange-100/50 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 mb-5">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured pets */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Доступные питомцы</h2>
              <p className="mt-2 text-gray-500">Они ждут именно тебя</p>
            </div>
            <Link to="/pets" className="hidden sm:inline-flex items-center gap-1 text-orange-600 font-semibold hover:text-orange-700 transition">
              Все питомцы <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">Питомцы пока не добавлены</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
          <div className="sm:hidden mt-6 text-center">
            <Link to="/pets" className="inline-flex items-center gap-1 text-orange-600 font-semibold">
              Все питомцы <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-extrabold text-white">Готов найти нового друга?</h2>
          <p className="mt-3 text-orange-100 max-w-lg mx-auto">Регистрируйся и начни искать питомца, который станет частью твоей семьи.</p>
          <Link
            to={user ? "/join" : "/register"}
            className="inline-block mt-8 px-8 py-3.5 rounded-xl bg-white text-orange-600 font-bold shadow-lg hover:shadow-xl hover:bg-orange-50 transition-all"
          >
            Начать сейчас
          </Link>
        </div>
      </section>
    </div>
  );
}
