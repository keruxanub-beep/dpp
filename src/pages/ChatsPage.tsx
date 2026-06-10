import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth, type Profile } from '../lib/auth';
import { MessageCircle, Send, X, CheckCircle, Clock, CircleUser as UserCircle, Plus, ArrowLeft } from 'lucide-react';

interface Chat {
  id: string;
  user_id: string;
  staff_id: string | null;
  status: 'open' | 'claimed' | 'closed';
  subject: string | null;
  created_at: string;
  closed_at: string | null;
  user_profile?: Profile;
  staff_profile?: Profile;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export default function ChatsPage() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMsgInit, setNewMsgInit] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);
  const isStaffOrAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  useEffect(() => {
    if (!user) return;
    fetchChats();
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      shouldScrollRef.current = true;
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      shouldScrollRef.current = false;
    }
  }, [messages]);

  async function fetchChats() {
    setLoading(true);
    let query = supabase
      .from('chats')
      .select('*, user_profile:profiles!chats_user_id_fkey(id, email, full_name, role), staff_profile:profiles!chats_staff_id_fkey(id, email, full_name, role)')
      .order('created_at', { ascending: false });

    const { data } = await query;
    if (data) {
      // For each chat, get last message and unread count
      const enriched = await Promise.all((data as Chat[]).map(async (chat) => {
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('content, created_at, sender_id')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1);
        const { count } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .neq('sender_id', user!.id);
        return {
          ...chat,
          last_message: msgs?.[0]?.content || '',
          last_message_at: msgs?.[0]?.created_at || chat.created_at,
          unread_count: count || 0,
        };
      }));
      setChats(enriched);
    }
    setLoading(false);
  }

  async function fetchMessages(chatId: string) {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, sender:profiles!chat_messages_sender_id_fkey(id, email, full_name, role)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    setMessages((data as ChatMessage[]) || []);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !selectedChat) return;
    setSending(true);
    await supabase.from('chat_messages').insert({
      chat_id: selectedChat.id,
      sender_id: user!.id,
      content: newMsg.trim(),
    });
    setNewMsg('');
    setSending(false);
    shouldScrollRef.current = true;
    fetchMessages(selectedChat.id);
    fetchChats();
  }

  async function createChat(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsgInit.trim()) return;
    setCreatingChat(true);
    const { data: chat } = await supabase.from('chats').insert({
      user_id: user!.id,
      status: 'open',
      subject: newSubject.trim() || null,
    }).select().single();
    if (chat) {
      await supabase.from('chat_messages').insert({
        chat_id: chat.id,
        sender_id: user!.id,
        content: newMsgInit.trim(),
      });
      setShowNewChatForm(false);
      setNewSubject('');
      setNewMsgInit('');
      await fetchChats();
      const newChat = (await supabase.from('chats').select('*, user_profile:profiles!chats_user_id_fkey(id, email, full_name, role), staff_profile:profiles!chats_staff_id_fkey(id, email, full_name, role)').eq('id', chat.id).single()).data as Chat;
      if (newChat) setSelectedChat(newChat);
    }
    setCreatingChat(false);
  }

  async function claimChat(chat: Chat) {
    await supabase.from('chats').update({ staff_id: user!.id, status: 'claimed' }).eq('id', chat.id);
    fetchChats();
    setSelectedChat({ ...chat, staff_id: user!.id, status: 'claimed', staff_profile: profile! });
    fetchMessages(chat.id);
  }

  async function closeChat(chat: Chat) {
    await supabase.from('chats').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', chat.id);
    fetchChats();
    setSelectedChat({ ...chat, status: 'closed', closed_at: new Date().toISOString() });
  }

  const getOtherName = (chat: Chat) => {
    if (isStaffOrAdmin) return chat.user_profile?.full_name || chat.user_profile?.email || 'Пользователь';
    return chat.staff_profile?.full_name || (chat.status === 'open' ? 'Ожидание ответа...' : 'Сотрудник');
  };

  const getInitial = (name: string) => name[0]?.toUpperCase() || '?';

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  // Responsive: on mobile, if chat selected, show only chat; otherwise show list
  const [mobileShowChat, setMobileShowChat] = useState(false);
  useEffect(() => { setMobileShowChat(!!selectedChat); }, [selectedChat]);

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-8">
      <div className="bg-white sm:rounded-2xl sm:shadow-lg sm:border border-gray-200 overflow-hidden flex flex-col md:flex-row" style={{ height: 'calc(100vh - 4rem)' }}>

        {/* Sidebar - Chat list */}
        <div className={`${mobileShowChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-gray-200 bg-gray-50`}>
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Чаты</h2>
              {!isStaffOrAdmin && (
                <button onClick={() => setShowNewChatForm(true)} className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition" title="Новый чат">
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
            {isStaffOrAdmin && (
              <div className="mt-2 flex gap-1">
                <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">Сотрудник</span>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Все чаты видны</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет чатов</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => { setSelectedChat(chat); setMobileShowChat(true); }}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-white transition ${
                    selectedChat?.id === chat.id ? 'bg-white border-l-2 border-l-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                      chat.status === 'open' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      chat.status === 'claimed' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      'bg-gray-400'
                    }`}>
                      {getInitial(getOtherName(chat))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 text-sm truncate">{getOtherName(chat)}</span>
                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">{formatTime(chat.last_message_at || chat.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-gray-500 truncate">{chat.last_message || (chat.subject || 'Нет сообщений')}</span>
                        {(chat.unread_count ?? 0) > 0 && (
                          <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shrink-0 ml-1">{chat.unread_count}</span>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          chat.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                          chat.status === 'claimed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {chat.status === 'open' ? 'Ожидает' : chat.status === 'claimed' ? 'В процессе' : 'Закрыт'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className={`${mobileShowChat ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-white`}>
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
                <button onClick={() => { setSelectedChat(null); setMobileShowChat(false); }} className="md:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  selectedChat.status === 'open' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                  selectedChat.status === 'claimed' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                  'bg-gray-400'
                }`}>
                  {getInitial(getOtherName(selectedChat))}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{getOtherName(selectedChat)}</div>
                  <div className="text-xs text-gray-400">
                    {selectedChat.status === 'open' ? 'Ожидает ответа сотрудника' :
                     selectedChat.status === 'claimed' ? `Сотрудник: ${selectedChat.staff_profile?.full_name || 'назначен'}` :
                     'Диалог завершён'}
                  </div>
                </div>
                {isStaffOrAdmin && selectedChat.status === 'open' && (
                  <button onClick={() => claimChat(selectedChat)} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition">
                    Взять чат
                  </button>
                )}
                {isStaffOrAdmin && selectedChat.status === 'claimed' && selectedChat.staff_id === user?.id && (
                  <button onClick={() => closeChat(selectedChat)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition">
                    Закончить диалог
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/50 space-y-3">
                {selectedChat.subject && (
                  <div className="text-center text-xs text-gray-400 py-2">
                    Тема: {selectedChat.subject}
                  </div>
                )}
                {selectedChat.status === 'open' && !isStaffOrAdmin && (
                  <div className="text-center py-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                      <Clock className="w-3 h-3" /> Ожидание ответа сотрудника...
                    </span>
                  </div>
                )}
                {isStaffOrAdmin && selectedChat.status === 'open' && (
                  <div className="text-center py-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      <UserCircle className="w-3 h-3" /> Чат свободен — нажмите «Взять чат»
                    </span>
                  </div>
                )}
                {selectedChat.status === 'closed' && (
                  <div className="text-center py-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" /> Диалог завершён
                    </span>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.sender_id === user!.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isMine ? 'order-2' : ''}`}>
                        {!isMine && (
                          <div className="text-[11px] text-gray-400 mb-0.5 ml-1">
                            {msg.sender?.full_name || msg.sender?.email} {msg.sender?.role === 'staff' && '(Сотрудник)'}
                          </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <div className={`text-[10px] text-gray-400 mt-0.5 ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedChat.status !== 'closed' && (selectedChat.status === 'claimed' || !isStaffOrAdmin) && (
                <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      placeholder="Написать сообщение..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-sm"
                    />
                    <button type="submit" disabled={sending || !newMsg.trim()} className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-40">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              )}
              {selectedChat.status === 'closed' && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-400">
                  Диалог завершён. Создайте новый чат, если нужен помощь.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Выберите чат</p>
                <p className="text-sm mt-1">Или начните новый разговор</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New chat modal */}
      {showNewChatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Новый чат</h3>
              <button onClick={() => setShowNewChatForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createChat} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тема (необязательно)</label>
                <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Вопрос о питомце..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение</label>
                <textarea required rows={4} value={newMsgInit} onChange={(e) => setNewMsgInit(e.target.value)} placeholder="Опишите ваш вопрос..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNewChatForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Отмена</button>
                <button type="submit" disabled={creatingChat} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-60">
                  {creatingChat ? 'Создаём...' : 'Начать чат'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
