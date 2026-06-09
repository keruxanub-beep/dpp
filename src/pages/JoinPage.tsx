import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Heart, Users, MessageCircle, PawPrint, ArrowRight, HandHeart, Shield, Sparkles } from 'lucide-react';

export default function JoinPage() {
  const { profile } = useAuth();

  const actions = [
    {
      icon: PawPrint,
      title: 'Усыновить питомца',
      desc: 'Найдите себе верного друга среди сотен питомцев, ждущих дом.',
      href: '/pets',
      color: 'from-orange-400 to-orange-600',
    },
    {
      icon: MessageCircle,
      title: 'Написать в поддержку',
      desc: 'Задайте вопрос нашим сотрудникам — мы всегда готовы помочь.',
      href: '/chats',
      color: 'from-blue-400 to-blue-600',
    },
    {
      icon: HandHeart,
      title: 'Стать волонтёром',
      desc: 'Помогайте приютам и бездомным животным как волонтёр.',
      href: '/about',
      color: 'from-green-400 to-green-600',
    },
    {
      icon: Users,
      title: 'Сообщество',
      desc: 'Присоединяйтесь к сообществу любителей животных.',
      href: '/contact',
      color: 'from-purple-400 to-purple-600',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Добро пожаловать!
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Рад видеть тебя,{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
              {profile?.full_name || 'друг'}!
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Вы уже часть сообщества PetHome. Выберите, чем хотите заняться сегодня.
          </p>
        </div>
      </section>

      {/* Action cards */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-6">
            {actions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="group bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all hover:-translate-y-0.5"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition">{action.title}</h3>
                <p className="mt-2 text-gray-500 leading-relaxed">{action.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-orange-600 font-semibold text-sm">
                  Перейти <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-to-b from-orange-50/50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">Что вы получаете</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Любовь', desc: 'Найдёте преданного друга' },
              { icon: Shield, title: 'Безопасность', desc: 'Проверенные приюты и питомцы' },
              { icon: Users, title: 'Поддержка', desc: 'Команда всегда на связи' },
            ].map((b) => (
              <div key={b.title} className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                  <b.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900">{b.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
