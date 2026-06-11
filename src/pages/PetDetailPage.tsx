import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, Calendar, Heart, Share2, PawPrint, Check, X, Send, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

import { useAuth } from '../lib/auth';
import type { Pet } from '../lib/types';

const speciesLabels: Record<string, string> = {
  dog: 'Собака', cat: 'Кошка', bird: 'Птица', rabbit: 'Кролик', other: 'Другое',
};
const statusLabels: Record<string, string> = {
  available: 'Доступен для усыновления', adopted: 'Усыновлён', pending: 'Заявка на рассмотрении',
};
const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700', adopted: 'bg-gray-100 text-gray-500', pending: 'bg-yellow-100 text-yellow-700',
};
const petImages: Record<string, string> = {
  dog: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=800',
  cat: 'https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=800',
  bird: 'https://images.pexels.com/photos/45853/cockatiel-parrot-yellow-45853.jpeg?auto=compress&cs=tinysrgb&w=800',
  rabbit: 'https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg?auto=compress&cs=tinysrgb&w=800',
  other: 'https://images.pexels.com/photos/4587995/pexels-photo-4587995.jpeg?auto=compress&cs=tinysrgb&w=800',
};

interface AdoptionForm {
  full_name: string;
  phone: string;
  email: string;
  home_type: '' | 'apartment' | 'house' | 'other';
  has_other_pets: boolean;
  other_pets_desc: string;
  experience: string;
  reason: string;
}
const emptyForm: AdoptionForm = {
  full_name: '', phone: '', email: '', home_type: '',
  has_other_pets: false, other_pets_desc: '', experience: '', reason: '',
};

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [imgError, setImgError] = useState(false);
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);
  const [adoptionForm, setAdoptionForm] = useState<AdoptionForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [adoptionError, setAdoptionError] = useState('');
  const [adoptionSuccess, setAdoptionSuccess] = useState(false);
  const [existingRequest, setExistingRequest] = useState(false);

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
    supabase.from('adoption_requests').select('id').eq('pet_id', id).eq('user_id', user.id).eq('status', 'pending').maybeSingle().then(({ data }) => {
      setExistingRequest(!!data);
    });
  }, [id, user]);

  useEffect(() => {
    if (profile && showAdoptionForm) {
      setAdoptionForm(prev => ({
        ...prev,
        full_name: prev.full_name || profile.full_name || '',
        email: prev.email || profile.email || '',
      }));
    }
  }, [profile, showAdoptionForm]);

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

  async function handleAdoptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !pet) return;
    setAdoptionError('');
    setSubmitting(true);

    const { error } = await supabase.from('adoption_requests').insert({
      user_id: user.id,
      pet_id: pet.id,
      full_name: adoptionForm.full_name,
      phone: adoptionForm.phone,
      email: adoptionForm.email,
      home_type: adoptionForm.home_type,
      has_other_pets: adoptionForm.has_other_pets,
      other_pets_desc: adoptionForm.other_pets_desc || null,
      experience: adoptionForm.experience || null,
      reason: adoptionForm.reason,
    });

    if (error) {
      setAdoptionError(error.message);
      setSubmitting(false);
      return;
    }

    await supabase.from('pets').update({ status: 'pending' }).eq('id', pet.id);
    setPet({ ...pet, status: 'pending' });
    setAdoptionSuccess(true);
    setSubmitting(false);
    setExistingRequest(true);
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
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-orange-50">
          {!imgError ? (
            <img
              src={img}
              alt={pet.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-[260px] sm:h-[400px] object-cover"
            />
          ) : (
            <div className="w-full h-[260px] sm:h-[400px] flex items-center justify-center">
              <PawPrint className="w-24 h-24 text-orange-200" />
            </div>
          )}
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
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${statusColors[pet.status]}`}>
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

          {/* Adoption actions */}
          {user && pet.status === 'available' && !existingRequest && !adoptionSuccess && (
            <div className="mt-8">
              <button
                onClick={() => setShowAdoptionForm(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-200 hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                <Heart className="w-5 h-5" />
                Хочу усыновить
              </button>
            </div>
          )}

          {user && pet.status === 'pending' && existingRequest && !adoptionSuccess && (
            <div className="mt-8 flex items-center gap-2 px-5 py-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Ваша заявка на рассмотрении</p>
                <p className="text-xs text-yellow-600 mt-0.5">Администратор рассмотрит вашу заявку в ближайшее время</p>
              </div>
            </div>
          )}

          {adoptionSuccess && (
            <div className="mt-8 flex items-center gap-2 px-5 py-4 rounded-xl bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Заявка отправлена!</p>
                <p className="text-xs text-green-600 mt-0.5">Статус питомца изменён на «Ожидание». Мы уведомим вас о решении.</p>
              </div>
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

      {/* Adoption request modal */}
      {showAdoptionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Заявка на усыновление</h3>
              <button onClick={() => setShowAdoptionForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdoptionSubmit} className="p-6 space-y-4">
              {adoptionError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{adoptionError}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО *</label>
                <input required value={adoptionForm.full_name} onChange={(e) => setAdoptionForm({ ...adoptionForm, full_name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                  <input required value={adoptionForm.phone} onChange={(e) => setAdoptionForm({ ...adoptionForm, phone: e.target.value })} placeholder="+7 (999) 123-45-67" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" value={adoptionForm.email} onChange={(e) => setAdoptionForm({ ...adoptionForm, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип жилья *</label>
                <select required value={adoptionForm.home_type} onChange={(e) => setAdoptionForm({ ...adoptionForm, home_type: e.target.value as AdoptionForm['home_type'] })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                  <option value="">Выберите</option>
                  <option value="apartment">Квартира</option>
                  <option value="house">Дом</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <input type="checkbox" checked={adoptionForm.has_other_pets} onChange={(e) => setAdoptionForm({ ...adoptionForm, has_other_pets: e.target.checked })} className="rounded border-gray-300 text-orange-500 focus:ring-orange-300" />
                  Есть другие питомцы
                </label>
                {adoptionForm.has_other_pets && (
                  <input value={adoptionForm.other_pets_desc} onChange={(e) => setAdoptionForm({ ...adoptionForm, other_pets_desc: e.target.value })} placeholder="Опишите ваших питомцев" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 mt-2" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Опыт содержания животных</label>
                <input value={adoptionForm.experience} onChange={(e) => setAdoptionForm({ ...adoptionForm, experience: e.target.value })} placeholder="Был ли у вас опыт..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Почему хотите усыновить? *</label>
                <textarea required rows={3} value={adoptionForm.reason} onChange={(e) => setAdoptionForm({ ...adoptionForm, reason: e.target.value })} placeholder="Расскажите, почему именно этот питомец..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdoptionForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Отмена</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {submitting ? 'Отправляем...' : 'Отправить заявку'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
