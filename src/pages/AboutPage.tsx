import { Heart, PawPrint, Shield, Users, Target, Award } from 'lucide-react';

const team = [
  {
    name: 'Анна Соколова',
    role: 'Основатель',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
    desc: 'Начала PetHome после того, как спасла бездомного щенка с улицы Москвы.',
  },
  {
    name: 'Дмитрий Волков',
    role: 'Ветеринарный врач',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
    desc: 'Обеспечивает медицинский уход и контроль здоровья всех питомцев.',
  },
  {
    name: 'Елена Иванова',
    role: 'Координатор усыновлений',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
    desc: 'Связывает питомцев с будущими хозяевами и помогает в адаптации.',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Забота',
    desc: 'Каждый питомец заслуживает любовь, внимание и достойное обращение.',
  },
  {
    icon: Shield,
    title: 'Ответственность',
    desc: 'Мы тщательно проверяем будущих хозяев перед усыновлением.',
  },
  {
    icon: Target,
    title: 'Прозрачность',
    desc: 'Вся информация о питомцах и процессе усыновления открыта и доступна.',
  },
  {
    icon: Users,
    title: 'Сообщество',
    desc: 'Мы объединяем волонтёров, приюты и любящих хозяев.',
  },
];

export default function AboutPage() {
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
                О нас
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Мы помогаем
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                  животным найти дом
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                PetHome — это платформа, которая соединяет бездомных животных с людьми, готовыми дать им любовь и заботу. Мы верим, что каждый питомец заслуживает шанса на счастливую жизнь.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-200 to-orange-300 rounded-3xl blur-2xl opacity-40" />
                <img
                  src="https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Команда PetHome с питомцами"
                  className="relative rounded-3xl shadow-2xl w-full object-cover h-[420px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Наша миссия</h2>
            <div className="mt-6 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto" />
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Сократить количество бездомных животных в России, создав удобную и прозрачную платформу для усыновления. Мы сотрудничаем с приютами, волонтёрами и ветеринарными клиниками, чтобы каждый питомец получил медицинскую помощь и нашёл любящую семью.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gradient-to-b from-white to-orange-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Наши ценности</h2>
            <p className="mt-3 text-gray-500">Что нами движет</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50 hover:shadow-lg hover:shadow-orange-100/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 mb-4">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Наш путь</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-8">
            {[
              { year: '2022', title: 'Начало', desc: 'Анна Соколова спасла щенка с улицы и решила создать платформу для помощи бездомным животным.' },
              { year: '2023', title: 'Первые 100 усыновлений', desc: 'PetHome помог первым 100 питомцам найти дом. Начали сотрудничество с приютами в 5 городах.' },
              { year: '2024', title: 'Расширение', desc: 'Платформа заработала в 12 городах России. Запущена система проверки будущих хозяев.' },
              { year: '2025', title: '500+ счастливых семей', desc: 'Более 500 питомцев нашли дом. PetHome стал крупнейшей платформой усыновления в стране.' },
            ].map((item, i) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
                    {item.year}
                  </div>
                  {i < 3 && <div className="w-0.5 flex-1 bg-orange-200 mt-2" />}
                </div>
                <div className="pb-2">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gradient-to-b from-orange-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Наша команда</h2>
            <p className="mt-3 text-gray-500">Люди, которые делают PetHome возможным</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-orange-100/50 transition-all group">
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-orange-600 font-medium">{member.role}</p>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievement */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Усыновлённых питомцев' },
              { value: '12', label: 'Городов' },
              { value: '200+', label: 'Волонтёров' },
              { value: '50+', label: 'Приютов-партнёров' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</div>
                <div className="mt-1 text-orange-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Award className="w-14 h-14 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">Присоединяйтесь к нам</h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Станьте волонтёром, помогите приюту или усыновите питомца. Вместе мы можем изменить жизнь бездомных животных к лучшему.
          </p>
          <a
            href="/register"
            className="inline-block mt-8 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Начать сейчас
          </a>
        </div>
      </section>
    </div>
  );
}
