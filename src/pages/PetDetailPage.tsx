import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, Calendar, Heart, Share2, PawPrint, Check } from 'lucide-react';
import { useAuth } from '../lib/auth';
import type { Pet } from '../lib/types';

const speciesLabels: Record<string, string> = {
  dog: 'Собака', cat: 'Кошка', bird: 'Птица', rabbit: 'Кролик', other: 'Другое',
};
const statusLabels: Record<string, string> = {
  available: 'Доступен для усыновления', adopted: 'Усыновлён', pending: 'Ожидание',
};
const petImages: Record<string, string> = {
  dog: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=800',
  cat: 'https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=800',
  bird: 'https://images.pexels.com/photos/45853/cockatiel-parrot-yellow-45853.jpeg?auto=compress&cs=tinysrgb&w=800',
  rabbit: 'https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg?auto=compress&cs=tinysrgb&w=800',
  other: 'https://images.pexels.com/photos/4587995/pexels-photo-4587995.jpeg?auto=compress&cs=tinysrgb&w=800',
};

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    supabase.from('pets').select('*').eq('id', id).single().then(({ data }) => {
      setPet(data as Pet | null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    supabase.from('favorites').select('id').eq('pet_id', id).eq('user_id', user.id).maybeSingle().then(({ data }) => {
      setIsFavorited(!!data);
    });
  }, [id, user]);

  async function handleToggleFavorite() {
    if (!user || !id) return;
    if (isFavorited) {
      await supabase.from('favorites').delete().eq('pet_id', id).eq('user_id', user.id);
      setIsFavorited(false);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, pet_id: id });
      setIsFavorited(true);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>;

  if (!pet) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h2 className="text-2xl font-bold text-gray-900">Питомец не найден</h2>
      <Link to="/pets" className="mt-4 inline-flex items-center gap-2 text-orange-600 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Вернуться к списку
      </Link>
    </div>
  );

  const img = pet.image_url || petImages[pet.species] || petImages.other;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Назад
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img src={img} alt={pet.name} className="w-full h-[400px] object-cover" />
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow transition-all duration-200 ${
                isFavorited ? 'text-red-500 hover:text-red-600 scale-110' : 'text-gray-400 hover:text-red-500'
              }`}
              title={isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow transition-all duration-200 text-gray-400 hover:text-orange-500"
              title="Скопировать ссылку"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-green-100 text-green-700">
            {statusLabels[pet.status]}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{pet.name}</h1>
          {pet.breed && <p className="text-lg text-gray-500 mt-1">{pet.breed}</p>}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <InfoItem label="Вид" value={speciesLabels[pet.species]} />
            <InfoItem label="Возраст" value={pet.age} />
            <InfoItem label="Пол" value={pet.gender === 'male' ? 'Мальчик' : 'Девочка'} />
            <InfoItem label="Размер" value={pet.size === 'small' ? 'Маленький' : pet.size === 'medium' ? 'Средний' : pet.size === 'large' ? 'Большой' : '-'} />
          </div>

          <div className="mt-4 flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4 text-orange-400" />
            <span>{pet.location}</span>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">О питомце</h3>
            <p className="text-gray-600 leading-relaxed">{pet.description}</p>
          </div>

          <div className="mt-6">
            <Calendar className="w-4 h-4 text-gray-400 inline mr-1" />
            <span className="text-sm text-gray-400">Добавлен {new Date(pet.created_at).toLocaleDateString('ru-RU')}</span>
          </div>

          {copied && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              <Check className="w-4 h-4" /> Ссылка скопирована!
            </div>
          )}

          {user && pet.status === 'available' && (
            <div className="mt-8">
              <Link
                to="/pets"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-200 hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                <Heart className="w-5 h-5" />
                Хочу усыновить
              </Link>
            </div>
          )}

          {!user && pet.status === 'available' && (
            <div className="mt-8 p-4 rounded-xl bg-orange-50 border border-orange-200">
              <p className="text-sm text-orange-700">Войдите в аккаунт, чтобы начать процесс усыновления.</p>
              <Link to="/login" className="mt-2 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700">Войти &rarr;</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3">
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}
