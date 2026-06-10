import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PawPrint, Menu, X, LogOut, Shield, User, MessageCircle, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const { user, profile, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setUnreadChats(0); return; }
    const isAdminOrStaff = profile?.role === 'admin' || profile?.role === 'staff';
    if (isAdminOrStaff) {
      // Staff/admin: count open chats
      supabase.from('chats').select('id', { count: 'exact', head: true }).eq('status', 'open').then(({ count }) => setUnreadChats(count || 0));
    } else {
      // Regular user: count chats where status != closed (active chats)
      supabase.from('chats').select('id', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'closed').then(({ count }) => setUnreadChats(count || 0));
    }
  }, [user, profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-orange-300 transition-shadow">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                PetHome
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition font-medium">Главная</Link>
              <Link to="/pets" className="px-4 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition font-medium">Питомцы</Link>
              <Link to="/about" className="px-4 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition font-medium">О нас</Link>
              <Link to="/contact" className="px-4 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition font-medium">Общайся</Link>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="px-4 py-2 rounded-lg text-orange-600 hover:bg-orange-50 transition font-medium flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Админ
                </Link>
              )}
              {profile?.role === 'staff' && (
                <Link to="/chats" className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition font-medium flex items-center gap-1">
                  <UserCog className="w-4 h-4" /> Чаты поддержки
                </Link>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-orange-100 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link to="/chats" className="relative p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition" title="Чаты">
                    <MessageCircle className="w-5 h-5" />
                    {unreadChats > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                        {unreadChats}
                      </span>
                    )}
                  </Link>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
                    <User className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-800">{profile?.full_name || profile?.email}</span>
                    {profile?.role === 'staff' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Сотрудник</span>}
                  </div>
                  <button onClick={handleSignOut} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Выйти">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition font-medium">Вход</Link>
                  <Link to="/register" className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all">Регистрация</Link>
                </>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-orange-50">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-orange-100 bg-white pb-4">
            <nav className="flex flex-col px-4 pt-2 gap-1">
              <Link to="/" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-gray-600 hover:bg-orange-50 font-medium">Главная</Link>
              <Link to="/pets" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-gray-600 hover:bg-orange-50 font-medium">Питомцы</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-gray-600 hover:bg-orange-50 font-medium">О нас</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-gray-600 hover:bg-orange-50 font-medium">Общайся с нами</Link>
              {profile?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-orange-600 hover:bg-orange-50 font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Админ-панель
                </Link>
              )}
              {profile?.role === 'staff' && (
                <Link to="/chats" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2">
                  <UserCog className="w-4 h-4" /> Чаты поддержки
                </Link>
              )}
              <div className="border-t border-orange-100 mt-2 pt-2">
                {user ? (
                  <>
                    <Link to="/chats" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-gray-600 hover:bg-orange-50 font-medium flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Чаты
                      {unreadChats > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadChats}</span>}
                    </Link>
                    <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                      {profile?.full_name || profile?.email}
                      {profile?.role === 'staff' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Сотрудник</span>}
                    </div>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 font-medium flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-600 hover:bg-orange-50 font-medium">Вход</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-center mt-1">Регистрация</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <PawPrint className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">PetHome</span>
              </div>
              <p className="text-sm leading-relaxed">Помогаем бездомным животным найти любящий дом. Каждый питомец заслуживает заботу и внимание.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Навигация</h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/" className="hover:text-orange-400 transition">Главная</Link>
                <Link to="/pets" className="hover:text-orange-400 transition">Найти питомца</Link>
                <Link to="/about" className="hover:text-orange-400 transition">О нас</Link>
                <Link to="/contact" className="hover:text-orange-400 transition">Общайся с нами</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Контакты</h4>
              <div className="flex flex-col gap-2 text-sm">
                <span>info@pethome.ru</span>
                <span>+7 (999) 123-45-67</span>
                <span>Москва, ул. Добрая, 42</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
            PetHome &copy; 2026. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
