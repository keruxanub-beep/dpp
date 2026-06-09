import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import PetCard from '../components/PetCard';
import type { Pet } from '../lib/types';
import { useAuth } from '../lib/auth';

const speciesOptions = [
  { value: '', label: 'Все виды' },
  { value: 'dog', label: 'Собаки' },
  { value: 'cat', label: 'Кошки' },
  { value: 'bird', label: 'Птицы' },
  { value: 'rabbit', label: 'Кролики' },
  { value: 'other', label: 'Другие' },
];

const sizeOptions = [
  { value: '', label: 'Любой размер' },
  { value: 'small', label: 'Маленький' },
  { value: 'medium', label: 'Средний' },
  { value: 'large', label: 'Большой' },
];

const genderOptions = [
  { value: '', label: 'Любой пол' },
  { value: 'male', label: 'Мальчик' },
  { value: 'female', label: 'Девочка' },
];

export default function PetsPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [size, setSize] = useState('');
  const [gender, setGender] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPets();
  }, [species, size, gender]);

  useEffect(() => {
    if (user) fetchFavorites();
    else setFavoritedIds(new Set());
  }, [user]);

  async function fetchPets() {
    setLoading(true);
    let query = supabase.from('pets').select('*').eq('status', 'available').order('created_at', { ascending: false });
    if (species) query = query.eq('species', species);
    if (size) query = query.eq('size', size);
    if (gender) query = query.eq('gender', gender);
    const { data } = await query;
    setPets((data as Pet[]) || []);
    setLoading(false);
  }

  async function fetchFavorites() {
    const { data } = await supabase.from('favorites').select('pet_id');
    if (data) setFavoritedIds(new Set(data.map((f) => f.pet_id)));
  }

  async function handleToggleFavorite(petId: string, isFavorited: boolean) {
    if (!user) return;
    if (isFavorited) {
      await supabase.from('favorites').delete().eq('pet_id', petId).eq('user_id', user.id);
      setFavoritedIds((prev) => { const next = new Set(prev); next.delete(petId); return next; });
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, pet_id: petId });
      setFavoritedIds((prev) => new Set([...prev, petId]));
    }
  }

  const filtered = search
    ? pets.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.breed?.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
      )
    : pets;

  const hasFilters = species || size || gender;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Найти питомца</h1>
        <p className="mt-2 text-gray-500">Выбери своего нового лучшего друга</p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, породе, городу..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border font-medium flex items-center gap-2 transition ${
              hasFilters ? 'border-orange-300 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Фильтры</span>
            {hasFilters && <span className="w-2 h-2 rounded-full bg-orange-500" />}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Вид</label>
                <select value={species} onChange={(e) => setSpecies(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                  {speciesOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Размер</label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                  {sizeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Пол</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                  {genderOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            {hasFilters && (
              <button onClick={() => { setSpecies(''); setSize(''); setGender(''); }} className="mt-4 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium">
                <X className="w-4 h-4" /> Сбросить фильтры
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-56 bg-gray-100" />
              <div className="p-5 space-y-3"><div className="h-5 bg-gray-100 rounded w-2/3" /><div className="h-4 bg-gray-100 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">Питомцы не найдены</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">Найдено: {filtered.length}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                isFavorited={favoritedIds.has(pet.id)}
                onToggleFavorite={user ? handleToggleFavorite : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
