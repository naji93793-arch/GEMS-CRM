/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Send, Search, Users, Shield, MessageSquare, Trash2, Calendar, Smile, ThumbsUp, Tag, Volume2, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderUsername: string;
  senderRole: 'admin' | 'employee';
  text: string;
  timestamp: string;
  timeMs: number;
  badge?: 'مهم' | 'استفسار' | 'متابعة عاجلة' | 'مغلق' | 'عام';
  likes: string[]; // قائمة إيميلات من قام بالإعجاب بالرسالة
}

interface TeamChatProps {
  user: User;
}

// ألوان مخصصة لكل مرسل بناءً على بداية اسمه أو الإيميل الخاص به لجمالية الواجهة
const AVATAR_COLORS: Record<string, string> = {
  'saadabugabl@gmail.com': 'bg-emerald-600',
  'meeraelasanhory@icloud.com': 'bg-purple-600',
  'rehamhesham995@gmail.com': 'bg-pink-600',
  'ebiedayad1@gmail.com': 'bg-blue-600',
  'naji93793@gmail.com': 'bg-indigo-600',
};

const getAvatarColor = (email: string) => {
  return AVATAR_COLORS[email.toLowerCase()] || 'bg-slate-600';
};

export default function TeamChat({ user }: TeamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<'مهم' | 'استفسار' | 'متابعة عاجلة' | 'مغلق' | 'عام'>('عام');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all'); // all, important, queries, mine
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // تحميل وإعداد الدردشة
  useEffect(() => {
    loadMessages();
    
    // محاكاة المزامنة اللحظية للدردشة كل ثانيتين للحصول على إحساس الدردشة الحية والمباشرة
    const interval = setInterval(() => {
      loadMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // تمرير تلقائي للأشخاص إلى أسفل الرسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = () => {
    const raw = localStorage.getItem('gems_crm_team_chat');
    if (raw) {
      setMessages(JSON.parse(raw));
    } else {
      // رسائل ترحيبية وتوضيحية تأسيسية للنظام
      const initialMsgs: ChatMessage[] = [
        {
          id: 'init_1',
          senderName: 'سعد أبو جبل',
          senderEmail: 'saadabugabl@gmail.com',
          senderUsername: 'saad_gems',
          senderRole: 'admin',
          text: 'أهلاً بفريق العمل في نظام GEMS CRM المطور! مرحباً بكم في ساحة التنسيق السريع والدردشة النشطة.',
          timestamp: '10:00 ص',
          timeMs: Date.now() - 3600000 * 2,
          badge: 'عام',
          likes: []
        },
        {
          id: 'init_2',
          senderName: 'سعد أبو جبل',
          senderEmail: 'saadabugabl@gmail.com',
          senderUsername: 'saad_gems',
          senderRole: 'admin',
          text: 'يرجى من جميع موظفي المبيعات إضافة ومتابعة تواصلات العملاء مباشرة وتحديد مواعيد الاتصالات وتكثيف جهود المتابعة اليومية.',
          timestamp: '10:05 ص',
          timeMs: Date.now() - 3600000,
          badge: 'مهم',
          likes: []
        }
      ];
      localStorage.setItem('gems_crm_team_chat', JSON.stringify(initialMsgs));
      setMessages(initialMsgs);
    }
  };

  // إرسال رسالة جديدة
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const today = new Date();
    // صياغة التوقيت بالعربية
    const timeStr = today.toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      senderName: user.name,
      senderEmail: user.email,
      senderUsername: user.username,
      senderRole: user.role,
      text: inputText.trim(),
      timestamp: timeStr,
      timeMs: Date.now(),
      badge: selectedBadge !== 'عام' ? selectedBadge : undefined,
      likes: []
    };

    const updated = [...messages, newMsg];
    localStorage.setItem('gems_crm_team_chat', JSON.stringify(updated));
    setMessages(updated);
    setInputText('');
    setSelectedBadge('عام');
  };

  // مسح كامل الدردشة (للصلاحيات الاستثنائية سعد أو ناجي الإدارة)
  const handleClearChat = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في تنظيف ومسح سجل دردشة فريق العمل بأكمله؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      const initialMsgs: ChatMessage[] = [
        {
          id: 'init_clear',
          senderName: user.name,
          senderEmail: user.email,
          senderUsername: user.username,
          senderRole: user.role,
          text: 'تم تنظيف سجل غرفة العمليات وبدء سجل دردشة وتنسيق جديد ومحدد للشركة.',
          timestamp: new Date().toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit' }),
          timeMs: Date.now(),
          badge: 'عام',
          likes: []
        }
      ];
      localStorage.setItem('gems_crm_team_chat', JSON.stringify(initialMsgs));
      setMessages(initialMsgs);
    }
  };

  // تفعيل وإلغاء الإعجاب بالرسالة
  const handleToggleLike = (msgId: string) => {
    const updated = messages.map(msg => {
      if (msg.id === msgId) {
        const hasLiked = msg.likes.includes(user.email);
        const newLikes = hasLiked 
          ? msg.likes.filter(em => em !== user.email)
          : [...msg.likes, user.email];
        return { ...msg, likes: newLikes };
      }
      return msg;
    });
    localStorage.setItem('gems_crm_team_chat', JSON.stringify(updated));
    setMessages(updated);
  };

  // جلب كافة زملائنا المتواجدين (من localStorage مع إخفاء ناجي التام عن أي واجهة لغير ناجي)
  const getOnlineTeammates = () => {
    const rawUsers = localStorage.getItem('gems_crm_users_db');
    const dbUsers: User[] = rawUsers ? JSON.parse(rawUsers) : [];
    
    const isNajiLogged = user.email.toLowerCase() === 'naji93793@gmail.com';
    
    // تصفية ناجي من القائمة تماماً لغير ناجي، وجعل حساب سعد هو البارز كإدارة وحيد للجميع
    return dbUsers.filter(u => {
      const isNajiAcc = u.username === 'naji_gems' || u.username === 'naji_sales' || u.email.toLowerCase() === 'naji93793@gmail.com';
      return !isNajiAcc || isNajiLogged;
    });
  };

  // تصفية الرسائل النشطة بناء على البحث وفلاتر العرض المتعددة
  const filteredMessages = messages.filter(msg => {
    // 1. فلتر البحث النصي في محتوى الرسالة أو اسم المرسل
    const matchesSearch = 
      msg.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      msg.senderName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 2. فلاتر التبويبات العلوية
    if (activeFilter === 'important') return msg.badge === 'مهم' || msg.badge === 'متابعة عاجلة';
    if (activeFilter === 'queries') return msg.badge === 'استفسار';
    if (activeFilter === 'mine') return msg.senderEmail.toLowerCase() === user.email.toLowerCase();

    return true;
  });

  const isNajiActive = user.email.toLowerCase() === 'naji93793@gmail.com';
  const isSaadActive = user.email.toLowerCase() === 'saadabugabl@gmail.com';
  const canClearAll = isSaadActive || isNajiActive;

  return (
    <div className="space-y-6 font-sans pb-8 text-right" dir="rtl">
      {/* هيدر ترحيبي برأسية الدردشة المشتركة */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-650 text-red-650" />
            <h2 className="text-2xl font-black text-slate-800">
              رادار تواصل وتنسيق المبيعات اللحظي
            </h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            غرفة محادثة موحدة ومشفرة لتنسيق العملاء المتابعين، وتوزيع العمل، وتبادل الاستشارات السريعة بين موظفي مبيعات GEMS.
          </p>
        </div>
        {canClearAll && (
          <button
            onClick={handleClearChat}
            className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-250 hover:border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>تنظيف الغرفة العامة</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* صندوق الدردشة الأساسي (8 أعمدة) */}
        <div className="lg:col-span-9 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[650px]">
          {/* ترويسة الدردشة وبحث وفلاتر */}
          <div className="p-4 border-b border-slate-150 bg-slate-50/50 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-black text-slate-700">الغرفة التنسيقية العامة (GEMS Lounge)</span>
                <span className="text-[10px] text-slate-450 bg-slate-200 px-2 py-0.5 rounded font-bold">{filteredMessages.length} رسالة</span>
              </div>
              
              {/* شريط البحث عن تواصلات معينة */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="ابحث في سجل محادثات المبيعات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-right bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {/* الفلاتر الجانبية السريعة */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  activeFilter === 'all'
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setActiveFilter('important')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  activeFilter === 'important'
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ⚠️ البلاغات الهامة والعاجلة
              </button>
              <button
                onClick={() => setActiveFilter('queries')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  activeFilter === 'queries'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ❓ استفسارات مبيعات وشراكات
              </button>
              <button
                onClick={() => setActiveFilter('mine')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  activeFilter === 'mine'
                    ? 'bg-slate-700 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                رسائلي أنا
              </button>
            </div>
          </div>

          {/* تيار الرسائل المستمر والمنظم */}
          <div className="flex-grow overflow-y-auto p-4 bg-slate-50/35 space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 py-12">
                <MessageSquare className="w-12 h-12 stroke-1 opacity-60" />
                <p className="text-xs font-bold">لا يوجد رسائل مطابقة للفرز المحدد حالياً.</p>
                <p className="text-[10px] text-slate-400">كن أول من يكتب رسالة تنسيقية لزملائه المبيعات والمشرف العام.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.senderEmail.toLowerCase() === user.email.toLowerCase();
                const hasLiked = msg.likes.includes(user.email);
                
                // تصفية أمنية إضافية: في حالة كون المشاهد لصفحة المحادثة ليس ناجي، أي رسالة كتبها ناجي الإدارة (naji_gems) ستظهر باسم "مشرف عام خفي GEMS" أو "ممثل إدارة المحتوى"
                // وذلك استجابة لطلب المستخدم بكونه مخفياً ومستقلاً تاماً كإدارة عن المشرف العادي ومنسقي المبيعات
                const isNajiAcc = msg.senderUsername === 'naji_gems' || msg.senderEmail.toLowerCase() === 'naji93793@gmail.com';
                const displayName = (!isNajiActive && isNajiAcc) ? 'مشرف إدارة GEMS' : msg.senderName;
                const displayRole = (!isNajiActive && isNajiAcc) ? 'admin' : msg.senderRole;
                const displayAvatarEmail = (!isNajiActive && isNajiAcc) ? 'saadabugabl@gmail.com' : msg.senderEmail;

                return (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-3 transition-all duration-200 ${
                      isMe ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* لوحة الآفاتار الأنيقة */}
                    <div className={`w-9 h-9 rounded-full ${getAvatarColor(displayAvatarEmail)} text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0`}>
                      {displayName.substring(0, 2).toUpperCase()}
                    </div>

                    {/* فقاعة الرسالة المصممة ليكون مبيناً */}
                    <div className={`max-w-[75%] space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {/* اسم المرسل والوقيت */}
                      <div className="flex items-center gap-2 px-1 text-[10px] text-slate-450">
                        <span className="font-extrabold text-slate-700">{displayName}</span>
                        {displayRole === 'admin' && (
                          <span className="bg-red-50 text-red-600 px-1.5 py-0.2 text-[9px] font-bold rounded border border-red-200">
                            مشرف النظام
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-sans">{msg.timestamp}</span>
                      </div>

                      {/* متن الفقاعة الفعلي */}
                      <div className={`p-3.5 rounded-2xl relative shadow-xs leading-relaxed text-xs ${
                        isMe 
                          ? 'bg-red-650 bg-red-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-850 rounded-tl-none'
                      }`}>
                        {/* الشارات الملونة للضرورة */}
                        {msg.badge && (
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black mb-1.5 block w-fit ${
                            msg.badge === 'مهم' || msg.badge === 'متابعة عاجلة'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                            <span>{msg.badge === 'متابعة عاجلة' ? '🚨 متابعة عاجلة' : msg.badge}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-line select-text">{msg.text}</p>
                      </div>

                      {/* سطر التفاعلات السريعة مثل زر الإعجاب (Likes) */}
                      <div className="flex items-center gap-2 px-2 text-[10px] text-slate-400">
                        <button
                          onClick={() => handleToggleLike(msg.id)}
                          className={`flex items-center gap-1 hover:text-red-500 transition cursor-pointer font-bold ${
                            hasLiked ? 'text-red-600' : 'text-slate-450'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${hasLiked ? 'fill-current' : ''}`} />
                          <span>{msg.likes.length > 0 ? `${msg.likes.length} إعجاب` : 'أعجبني'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* تذييل الإدخال الموحد والذكي للدردشة */}
          <div className="p-4 border-t border-slate-150 bg-white">
            <form onSubmit={handleSendMessage} className="space-y-3">
              {/* شريط اختيار نوع البادج الأمني للرسالة */}
              <div className="flex items-center gap-2 pb-1 overflow-x-auto select-none no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
                  <Tag className="w-3 h-3 text-red-600" />
                  <span>شارة الرسالة:</span>
                </span>
                {(['عام', 'مهم', 'استفسار', 'متابعة عاجلة'] as const).map(badgeType => (
                  <button
                    key={badgeType}
                    type="button"
                    onClick={() => setSelectedBadge(badgeType)}
                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                      selectedBadge === badgeType
                        ? 'bg-slate-100 border-slate-350 text-slate-800 font-black shadow-xs'
                        : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {badgeType === 'عام' && '💬 تواصل عادي'}
                    {badgeType === 'مهم' && '⚠️ بلاغ هام'}
                    {badgeType === 'استفسار' && '❓ استفسار مبيعات'}
                    {badgeType === 'متابعة عاجلة' && '🚨 متابعة عميل'}
                  </button>
                ))}
              </div>

              {/* حقل ومدخل الكتابة المباشر */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتب هنا ما تركز عليه بخصوص العملاء، المتابعات أو تحديثات الصفقات..."
                  className="w-full text-right bg-slate-50 border border-slate-200 focus:border-red-550 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white transition"
                  maxLength={500}
                  required
                />
                <button
                  type="submit"
                  className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition duration-150 flex items-center justify-center cursor-pointer shrink-0"
                  title="إرسال عبر لوحة الصفقات"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* الموظفين والمسؤولين المتواجدين (3 أعمدة) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-150 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>فريق مبيعات GEMS المعتمد</span>
            </h3>

            {/* قائمة كروت الموظفين الإحصائية الفورية */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {getOnlineTeammates().map(member => (
                <div 
                  key={member.username} 
                  className="flex items-center gap-2.5 p-2 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-150 transition"
                >
                  <div className={`w-8 h-8 rounded-full ${getAvatarColor(member.email)} text-white flex items-center justify-center text-[10px] font-black uppercase`}>
                    {member.name.substring(0, 2)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-800 truncate">{member.name}</span>
                    <span className="text-[9px] text-slate-400 truncate uppercase tracking-widest leading-none mt-1">
                      {member.role === 'admin' ? 'Supervisor مشرف' : 'Sales Representative'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* صندوق للمعلومات والتنبيهات الأمنية */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/50 flex gap-2 items-start mt-4">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-amber-800">
                <span className="text-[10px] font-black block">قنوات المتابعة الآمنة:</span>
                <span className="text-[9px] leading-relaxed block text-amber-700">
                  جميع المحادثات والملحوظات بداخل هذه الغرفة تحفظ محلياً بشكل دائم وتتم مزامنتها كأصول تابعة لقسم المبيعات في شركة GEMS.
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
