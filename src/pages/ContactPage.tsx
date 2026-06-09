import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);

    if (!user) {
      setError('Войдите в аккаунт, чтобы отправить сообщение.');
      setSending(false);
      return;
    }

    // Create a chat with the user's message — all staff will see it
    const { data: chat, error: chatErr } = await supabase.from('chats').insert({
      user_id: user.id,
      status: 'open',
      subject: form.subject.trim() || null,
    }).select().single();

    if (chatErr || !chat) {
      setError('Не удалось создать чат. Попробуйте позже.');
      setSending(false);
      return;
    }

    const { error: msgErr } = await supabase.from('chat_messages').insert({
      chat_id: chat.id,
      sender_id: user.id,
      content: form.message.trim(),
    });

    if (msgErr) {
      setError('Не удалось отправить сообщение.');
      setSending(false);
      return;
    }

    setSending(false);
    navigate('/chats');
  };

  if (!user) {
    return (
      <div>
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
                <MessageCircle className="w-4 h-4" />
                Связаться с нами
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Общайся <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">с нами</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Чтобы написать нам, войдите в аккаунт или зарегистрируйтесь. Наши сотрудники всегда готовы помочь!
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <a href="/login" className="px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 transition">
                  Войти
                </a>
                <a href="/register" className="px-7 py-3 rounded-xl border-2 border-orange-200 text-orange-600 font-semibold hover:bg-orange-50 transition">
                  Регистрация
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4" />
              Связаться с нами
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Общайся <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">с нами</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Напишите сообщение — его увидят все сотрудники, и первый свободный сотрудник ответит вам в чате.
            </p>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-900">Контактная информация</h2>
              <p className="text-gray-500">Или свяжитесь с нами напрямую</p>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'Email', value: 'info@pethome.ru', href: 'mailto:info@pethome.ru' },
                  { icon: Phone, label: 'Телефон', value: '+7 (999) 123-45-67', href: 'tel:+79991234567' },
                  { icon: MapPin, label: 'Адрес', value: 'Москва, ул. Добрая, 42' },
                  { icon: Clock, label: 'Часы работы', value: 'Пн-Вс: 9:00 — 20:00' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">{item.label}</div>
                      {'href' in item && item.href ? (
                        <a href={item.href} className="text-gray-900 font-medium hover:text-orange-600 transition">{item.value}</a>
                      ) : (
                        <div className="text-gray-900 font-medium">{item.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Написать в поддержку</h3>
                <p className="text-sm text-gray-400 mb-6">Ваше сообщение увидят все сотрудники — первый свободный ответит вам в чате</p>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Тема</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition bg-white"
                    >
                      <option value="">Выберите тему</option>
                      <option value="adoption">Усыновление питомца</option>
                      <option value="volunteer">Стать волонтёром</option>
                      <option value="partnership">Сотрудничество с приютом</option>
                      <option value="problem">Проблема с сайтом</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Сообщение</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Опишите ваш вопрос..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-200 hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-60"
                  >
                    <Send className="w-5 h-5" />
                    {sending ? 'Отправляем...' : 'Начать чат с поддержкой'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
