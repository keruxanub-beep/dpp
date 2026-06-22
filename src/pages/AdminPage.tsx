import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Plus, Trash2, CreditCard as Edit3, X, PawPrint, Users, BarChart3, Shield, Ban, Unlock, Send, Mail, UserCog, Lock, FileText, Check, XCircle, Clock } from 'lucide-react';
import type { Pet } from '../lib/types';
import type { Profile } from '../lib/auth';
import type { AdoptionRequest } from '../lib/types';

const speciesOptions = [
  { value: 'dog', label: 'Собака' },
  { value: 'cat', label: 'Кошка' },
  { value: 'bird', label: 'Птица' },
  { value: 'rabbit', label: 'Кролик' },
  { value: 'other', label: 'Другое' },
];
const sizeOptions = [
  { value: 'small', label: 'Маленький' },
  { value: 'medium', label: 'Средний' },
  { value: 'large', label: 'Большой' },
];
const statusOptions = [
  { value: 'available', label: 'Доступен' },
  { value: 'pending', label: 'Ожидание' },
  { value: 'adopted', label: 'Усыновлён' },
];
const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', adopted: 'bg-gray-100 text-gray-500',
};
const statusLabels: Record<string, string> = { available: 'Доступен', pending: 'Ожидание', adopted: 'Усыновлён' };

const defaultPetImages: Record<string, string> = {
  dog: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=600',
  cat: 'https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=600',
  bird: 'https://images.pexels.com/photos/45853/cockatiel-parrot-yellow-45853.jpeg?auto=compress&cs=tinysrgb&w=600',
  rabbit: 'https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg?auto=compress&cs=tinysrgb&w=600',
  other: 'https://images.pexels.com/photos/4587995/pexels-photo-4587995.jpeg?auto=compress&cs=tinysrgb&w=600',
};

interface PetForm {
  name: string; species: string; breed: string; age: string; gender: string;
  size: string; description: string; recommendations: string; image_url: string; location: string; status: string;
}
const emptyForm: PetForm = {
  name: '', species: 'dog', breed: '', age: '', gender: 'male',
  size: 'medium', description: '', recommendations: '', image_url: '', location: '', status: 'available',
};

export default function AdminPage() {
  const { profile } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgTo, setMsgTo] = useState<Profile | null>(null);
  const [msgContent, setMsgContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [editing, setEditing] = useState<Pet | null>(null);
  const [form, setForm] = useState<PetForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'pets' | 'users' | 'stats' | 'adoptions'>('pets');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => { fetchPets(); fetchUsers(); fetchAdoptionRequests(); }, []);

  async function fetchPets() {
    setLoading(true);
    const { data } = await supabase.from('pets').select('*').order('created_at', { ascending: false });
    setPets((data as Pet[]) || []);
    setLoading(false);
  }

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as Profile[]) || []);
  }

  async function fetchAdoptionRequests() {
    const { data } = await supabase
      .from('adoption_requests')
      .select('*, pet:pets(id, name, species, breed, image_url), user_profile:profiles!adoption_requests_user_id_fkey(id, email, full_name)')
      .order('created_at', { ascending: false });
    setAdoptionRequests((data as AdoptionRequest[]) || []);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowPetModal(true);
  }

  function openEdit(pet: Pet) {
    setEditing(pet);
    setForm({
      name: pet.name, species: pet.species, breed: pet.breed || '', age: pet.age,
      gender: pet.gender, size: pet.size || 'medium', description: pet.description,
      recommendations: pet.recommendations || '', image_url: pet.image_url || '', 
      location: pet.location, status: pet.status,
    });
    setShowPetModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const imageUrl = form.image_url || defaultPetImages[form.species] || defaultPetImages.other;
    if (editing) {
      await supabase.from('pets').update({
        name: form.name, species: form.species, breed: form.breed || null, age: form.age,
        gender: form.gender, size: form.size || null, description: form.description,
        recommendations: form.recommendations || null, image_url: imageUrl,
        location: form.location, status: form.status,
      }).eq('id', editing.id);
    } else {
      await supabase.from('pets').insert({
        name: form.name, species: form.species, breed: form.breed || null, age: form.age,
        gender: form.gender, size: form.size || null, description: form.description,
        recommendations: form.recommendations || null, image_url: imageUrl,
        location: form.location, status: form.status,
        created_by: profile!.id,
      });
    }
    setSaving(false);
    setShowPetModal(false);
    fetchPets();
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить этого питомца?')) return;
    await supabase.from('pets').delete().eq('id', id);
    fetchPets();
  }

  async function changeRole(userId: string, newRole: 'user' | 'staff') {
    const { error } = await supabase.rpc('admin_change_role', { target_user_id: userId, new_role: newRole });
    if (error) { alert('Ошибка: ' + error.message); return; }
    fetchUsers();
  }

  async function toggleBlock(userId: string, currentlyBlocked: boolean) {
    const action = currentlyBlocked ? 'разблокировать' : 'заблокировать';
    if (!confirm(`Вы уверены, что хотите ${action} этого пользователя?`)) return;
    const { error } = await supabase.rpc('admin_toggle_block', { target_user_id: userId, should_block: !currentlyBlocked });
    if (error) { alert('Ошибка: ' + error.message); return; }
    fetchUsers();
  }

  function openMessage(user: Profile) {
    setMsgTo(user);
    setMsgContent('');
    setShowMsgModal(true);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgTo || !msgContent.trim()) return;
    setSendingMsg(true);
    const { data: chat, error: chatErr } = await supabase.from('chats').insert({
      user_id: msgTo.id,
      staff_id: profile!.id,
      status: 'claimed',
      subject: 'Сообщение от администратора',
    }).select().single();
    if (chatErr || !chat) {
      alert('Не удалось создать чат: ' + (chatErr?.message || 'Ошибка'));
      setSendingMsg(false);
      return;
    }
    await supabase.rpc('send_chat_message', { p_chat_id: chat.id, p_content: msgContent.trim() });
    setSendingMsg(false);
    setShowMsgModal(false);
    setMsgTo(null);
    setMsgContent('');
  }

  async function handleReviewRequest(requestId: string, newStatus: 'approved' | 'rejected') {
    const { error } = await supabase.rpc('review_adoption_request', {
      request_id: requestId,
      new_status: newStatus,
      notes: reviewNotes || null,
    });
    if (error) { alert('Ошибка: ' + error.message); return; }
    setReviewNotes('');
    fetchAdoptionRequests();
    fetchPets();
  }

  const pendingRequests = adoptionRequests.filter(r => r.status === 'pending');
  const processedRequests = adoptionRequests.filter(r => r.status !== 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Админ-панель</h1>
        <p className="mt-2 text-gray-500">Управление питомцами и пользователями</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pets.length}</div>
              <div className="text-sm text-gray-500">Всего питомцев</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pets.filter(p => p.status === 'available').length}</div>
              <div className="text-sm text-gray-500">Доступных</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-500">Пользователей</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pendingRequests.length}</div>
              <div className="text-sm text-gray-500">Заявок</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
        <button onClick={() => setTab('pets')} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === 'pets' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Питомцы
        </button>
        <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === 'users' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Пользователи
        </button>
        <button onClick={() => setTab('adoptions')} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === 'adoptions' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Заявки {pendingRequests.length > 0 && <span className="ml-1 bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{pendingRequests.length}</span>}
        </button>
        <button onClick={() => setTab('stats')} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === 'stats' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Статистика
        </button>
      </div>

      {/* Pets tab */}
      {tab === 'pets' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Список питомцев</h2>
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all">
              <Plus className="w-5 h-5" /> Добавить
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : pets.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><PawPrint className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Нет питомцев. Добавьте первого!</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Питомец</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Вид</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Локация</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Статус</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Действия</th>
                  </tr></thead>
                  <tbody>
                    {pets.map((pet) => (
                      <tr key={pet.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition">
                        <td className="px-4 py-3"><div className="flex items-center gap-3">
                          <img src={pet.image_url || defaultPetImages[pet.species]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div><div className="font-semibold text-gray-900">{pet.name}</div>{pet.breed && <div className="text-xs text-gray-400">{pet.breed}</div>}</div>
                        </div></td>
                        <td className="px-4 py-3 text-sm text-gray-600">{speciesOptions.find(s => s.value === pet.species)?.label}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{pet.location}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[pet.status]}`}>{statusLabels[pet.status]}</span></td>
                        <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(pet)} className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(pet.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Список пользователей</h2>
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Пользователей пока нет</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Пользователь</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Роль</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Дата регистрации</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Статус</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Действия</th>
                  </tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className={`border-b border-gray-50 transition ${u.blocked ? 'bg-red-50/50' : 'hover:bg-orange-50/30'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.blocked ? 'bg-gradient-to-br from-red-300 to-red-500' : 'bg-gradient-to-br from-orange-200 to-orange-400'}`}>
                                {(u.full_name || u.email)[0].toUpperCase()}
                              </div>
                              {u.blocked && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center border-2 border-white">
                                  <Lock className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className={`font-semibold ${u.blocked ? 'text-red-700' : 'text-gray-900'}`}>{u.full_name || 'Без имени'}</div>
                              <div className={`text-xs ${u.blocked ? 'text-red-400' : 'text-gray-400'}`}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-orange-100 text-orange-700' : u.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3" /> Админ</span>
                            ) : u.role === 'staff' ? (
                              <span className="inline-flex items-center gap-1"><UserCog className="w-3 h-3" /> Сотрудник</span>
                            ) : 'Пользователь'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                          {new Date(u.created_at).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3">
                          {u.blocked ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              <Lock className="w-3 h-3" /> Заблокирован
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Активен
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openMessage(u)} className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition" title="Написать">
                              <Mail className="w-4 h-4" />
                            </button>
                            {u.role === 'user' && !u.blocked && (
                              <button onClick={() => changeRole(u.id, 'staff')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition" title="Назначить сотрудником">
                                <UserCog className="w-3.5 h-3.5" /> Сотрудник
                              </button>
                            )}
                            {u.role === 'staff' && !u.blocked && (
                              <button onClick={() => changeRole(u.id, 'user')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition" title="Снять роль сотрудника">
                                <UserCog className="w-3.5 h-3.5" /> Снять
                              </button>
                            )}
                            {u.role !== 'admin' && !u.blocked && (
                              <button onClick={() => toggleBlock(u.id, false)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition" title="Заблокировать">
                                <Ban className="w-3.5 h-3.5" /> Блок
                              </button>
                            )}
                            {u.role !== 'admin' && u.blocked && (
                              <button onClick={() => toggleBlock(u.id, true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition" title="Разблокировать">
                                <Unlock className="w-3.5 h-3.5" /> Разблок
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Adoption requests tab */}
      {tab === 'adoptions' && (
        <div className="space-y-8">
          <h2 className="text-lg font-bold text-gray-900">Заявки на усыновление</h2>
          {pendingRequests.length === 0 && processedRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Заявок пока нет</p></div>
          ) : (
            <>
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-yellow-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Ожидают рассмотрения ({pendingRequests.length})</h3>
                  <div className="space-y-4">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="bg-white rounded-xl border border-yellow-200 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <img
                            src={req.pet?.image_url || defaultPetImages[req.pet?.species || 'other']}
                            alt={req.pet?.name}
                            className="w-20 h-20 rounded-xl object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-gray-900">{req.pet?.name || 'Питомец'}</h4>
                              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">Ожидание</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">От: {req.user_profile?.full_name || req.user_profile?.email || 'Пользователь'}</p>
                            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                              <div><span className="text-gray-400">Имя:</span> <span className="text-gray-700">{req.full_name}</span></div>
                              <div><span className="text-gray-400">Телефон:</span> <span className="text-gray-700">{req.phone}</span></div>
                              <div><span className="text-gray-400">Email:</span> <span className="text-gray-700">{req.email}</span></div>
                              <div><span className="text-gray-400">Жильё:</span> <span className="text-gray-700">{req.home_type === 'apartment' ? 'Квартира' : req.home_type === 'house' ? 'Дом' : req.home_type === 'other' ? 'Другое' : '-'}</span></div>
                              <div><span className="text-gray-400">Другие питомцы:</span> <span className="text-gray-700">{req.has_other_pets ? 'Да' : 'Нет'}{req.other_pets_desc ? ` — ${req.other_pets_desc}` : ''}</span></div>
                              <div><span className="text-gray-400">Опыт:</span> <span className="text-gray-700">{req.experience || '-'}</span></div>
                            </div>
                            <div className="mt-2 text-sm"><span className="text-gray-400">Причина:</span> <span className="text-gray-700">{req.reason}</span></div>
                            <div className="mt-4">
                              <input
                                type="text"
                                placeholder="Заметка администратора (необязательно)"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                              />
                            </div>
                            <div className="mt-3 flex gap-3">
                              <button onClick={() => handleReviewRequest(req.id, 'approved')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition">
                                <Check className="w-4 h-4" /> Одобрить
                              </button>
                              <button onClick={() => handleReviewRequest(req.id, 'rejected')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
                                <XCircle className="w-4 h-4" /> Отклонить
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {processedRequests.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Рассмотренные заявки</h3>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Питомец</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Заявитель</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Статус</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Заметка</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Дата</th>
                        </tr></thead>
                        <tbody>
                          {processedRequests.map((req) => (
                            <tr key={req.id} className="border-b border-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{req.pet?.name || 'Питомец'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{req.user_profile?.full_name || req.user_profile?.email}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {req.status === 'approved' ? 'Одобрена' : 'Отклонена'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell truncate max-w-[200px]">{req.admin_notes || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{new Date(req.reviewed_at || req.created_at).toLocaleDateString('ru-RU')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Stats tab */}
      {tab === 'stats' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Питомцы по статусу</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Доступных', count: pets.filter(p => p.status === 'available').length, color: 'bg-green-500' },
                { label: 'Ожидание', count: pets.filter(p => p.status === 'pending').length, color: 'bg-yellow-500' },
                { label: 'Усыновлено', count: pets.filter(p => p.status === 'adopted').length, color: 'bg-gray-400' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                  <div className={`w-3 h-3 rounded-full ${s.color} mb-3`} />
                  <div className="text-3xl font-bold text-gray-900">{s.count}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Пользователи</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-blue-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'user').length}</div>
                <div className="text-sm text-gray-500 mt-1">Пользователей</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-blue-400 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'staff').length}</div>
                <div className="text-sm text-gray-500 mt-1">Сотрудников</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-red-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{users.filter(u => u.blocked).length}</div>
                <div className="text-sm text-gray-500 mt-1">Заблокированных</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Заявки на усыновление</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{pendingRequests.length}</div>
                <div className="text-sm text-gray-500 mt-1">Ожидают</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-green-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{adoptionRequests.filter(r => r.status === 'approved').length}</div>
                <div className="text-sm text-gray-500 mt-1">Одобрены</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-red-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{adoptionRequests.filter(r => r.status === 'rejected').length}</div>
                <div className="text-sm text-gray-500 mt-1">Отклонены</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pet modal */}
      {showPetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Редактировать' : 'Добавить'} питомца</h3>
              <button onClick={() => setShowPetModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                  <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Вид</label>
                  <select value={form.species} onChange={(e) => setForm({...form, species: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                    {speciesOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Порода</label>
                  <input value={form.breed} onChange={(e) => setForm({...form, breed: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Возраст</label>
                  <input required value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} placeholder="2 года" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Пол</label>
                  <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                    <option value="male">Мальчик</option><option value="female">Девочка</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Размер</label>
                  <select value={form.size} onChange={(e) => setForm({...form, size: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                    {sizeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                    {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Локация</label>
                  <input required value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} placeholder="Москва" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Рекомендации по уходу</label>
                  <textarea rows={3} value={form.recommendations} onChange={(e) => setForm({...form, recommendations: e.target.value})} placeholder="Особый корм, прогулки 2 раза в день, не любит детей..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">URL изображения (необязательно)</label>
                  <input value={form.image_url} onChange={(e) => setForm({...form, image_url: e.target.value})} placeholder="https://..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPetModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Отмена</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-60">
                  {saving ? 'Сохраняем...' : editing ? 'Обновить' : 'Создать'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message modal */}
      {showMsgModal && msgTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Написать сообщение</h3>
              <button onClick={() => setShowMsgModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
                  {(msgTo.full_name || msgTo.email)[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{msgTo.full_name || 'Без имени'}</div>
                  <div className="text-xs text-gray-400">{msgTo.email}</div>
                </div>
              </div>
              <form onSubmit={sendMessage}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Сообщение</label>
                <textarea
                  required
                  rows={4}
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Введите сообщение для пользователя..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setShowMsgModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Отмена</button>
                  <button type="submit" disabled={sendingMsg} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> {sendingMsg ? 'Отправляем...' : 'Отправить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
