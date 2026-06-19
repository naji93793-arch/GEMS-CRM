/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, User } from './types';

// حسابات الموظفين الستة (5 موظفين + المشرف)
export const USERS: User[] = [
  { username: 'admin', name: 'المشرف العام', email: 'admin@gems.com', role: 'admin' },
  { username: 'ahmed', name: 'أحمد مصطفى', email: 'ahmed@gems.com', role: 'employee' },
  { username: 'sara', name: 'سارة الأحمد', email: 'sara@gems.com', role: 'employee' },
  { username: 'khaled', name: 'خالد الشمري', email: 'khaled@gems.com', role: 'employee' },
  { username: 'fatima', name: 'فاطمة الحوسني', email: 'fatima@gems.com', role: 'employee' },
  { username: 'youssef', name: 'يوسف العلي', email: 'youssef@gems.com', role: 'employee' }
];

// كلمات المرور الافتراضية للتجربة السهلة
export const USER_PASSWORDS: Record<string, string> = {
  'admin': 'admin123',
  'ahmed': 'ahmed123',
  'sara': 'sara123',
  'khaled': 'khaled123',
  'fatima': 'fatima123',
  'youssef': 'youssef123'
};

// البيانات الأولية التي تطابق شيت الإكسيل Book1_3.xlsx
export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'GEMS-1001',
    name: 'عبدالرحمن العبار',
    company: 'مجموعة إعمار التكنولوجية',
    phone: '+971 50 123 4567',
    emirate: 'دبي',
    clientFeedback: 'مهتم بالخدمات السحابية ويريد عرض أسعار تفصيلي في أقرب وقت.',
    partnerFeedback: 'تم إرسال عرض المبيعات الأولي وبانتظار الموافقة المالية.',
    status: 'متابعة',
    addDate: '2026-06-10',
    lastContact: '2026-06-15',
    nextFollowup: '2026-06-21',
    interestLevel: 'عالي',
    contactCount: 3,
    owner: 'أحمد مصطفى',
    ownerEmail: 'ahmed@gems.com'
  },
  {
    id: 'GEMS-1002',
    name: 'ميثاء بالمهيري',
    company: 'الشركة العربية الموحدة',
    phone: '+971 52 987 6543',
    emirate: 'أبوظبي',
    clientFeedback: 'العقد تم توقيعه والمشروع دخل حيز التنفيذ للتكامل مع الأنظمة.',
    partnerFeedback: 'تم استلام الدفعة الأولى وتسليم خطة العمل التنفيذية.',
    status: 'نفذ',
    addDate: '2026-06-01',
    lastContact: '2026-06-18',
    nextFollowup: '2026-07-01',
    interestLevel: 'عالي',
    contactCount: 5,
    owner: 'أحمد مصطفى',
    ownerEmail: 'ahmed@gems.com'
  },
  {
    id: 'GEMS-1003',
    name: 'خلفان السويدي',
    company: 'صناعات الشارقة الوطنية',
    phone: '+971 56 456 7890',
    emirate: 'الشارقة',
    clientFeedback: 'الميزانية الحالية لا تغطي القيمة المطلوبة للمشروع وتم تأجيل القرار للربع القادم.',
    partnerFeedback: 'العميل لديه رغبة لكن الإدارة المالية رفضت تخصيص الميزانية حالياً.',
    status: 'لم يتم التنفيذ',
    addDate: '2026-05-15',
    lastContact: '2026-06-10',
    nextFollowup: '2026-09-01',
    interestLevel: 'منخفض',
    contactCount: 2,
    notDoneReason: 'عدم توفر ميزانية كافية لدى العميل حالياً',
    owner: 'سارة الأحمد',
    ownerEmail: 'sara@gems.com'
  },
  {
    id: 'GEMS-1004',
    name: 'فاطمة الفلاسي',
    company: 'مجموعة الميدان للحلول الجوية',
    phone: '+971 50 222 3344',
    emirate: 'دبي',
    clientFeedback: 'تطلب إيضاحات إضافية حول التحديثات الأخيرة وحماية البيانات.',
    partnerFeedback: 'تجهيز ملف يشرح بروتوكولات الحماية ومقارنتها بالصناعة.',
    status: 'متابعة',
    addDate: '2026-06-12',
    lastContact: '2026-06-17',
    nextFollowup: '2026-06-20',
    interestLevel: 'عالي',
    contactCount: 2,
    owner: 'سارة الأحمد',
    ownerEmail: 'sara@gems.com'
  },
  {
    id: 'GEMS-1005',
    name: 'زايد بن طحنون',
    company: 'الواحة للاستشارات الهندسية',
    phone: '+971 55 555 6677',
    emirate: 'أبوظبي',
    clientFeedback: 'تم تسليم الحل البرمجي المتكامل والتدريب عليه بنجاح.',
    partnerFeedback: 'العميل راضٍ جداً وطلب دراسة لتوسيع التغطية لتشمل فرع رأس الخيمة.',
    status: 'نفذ',
    addDate: '2026-05-20',
    lastContact: '2026-06-14',
    nextFollowup: '2026-07-15',
    interestLevel: 'عالي',
    contactCount: 4,
    owner: 'خالد الشمري',
    ownerEmail: 'khaled@gems.com'
  },
  {
    id: 'GEMS-1006',
    name: 'شيخة الكتبي',
    company: 'الشرق للخدمات اللوجستية',
    phone: '+971 50 888 9900',
    emirate: 'عجمان',
    clientFeedback: 'تحتاج مهلة للتفكير والمناقشة مع الشركاء الفنيين قبل الالتزام.',
    partnerFeedback: 'تم إرسال نماذج سابقة مشابهة لنشاط قطاعهم لتعزيز الثقة.',
    status: 'متابعة',
    addDate: '2026-06-08',
    lastContact: '2026-06-16',
    nextFollowup: '2026-06-23',
    interestLevel: 'متوسط',
    contactCount: 3,
    owner: 'خالد الشمري',
    ownerEmail: 'khaled@gems.com'
  },
  {
    id: 'GEMS-1007',
    name: 'سالم الشامسي',
    company: 'بوابة الخليج التجارية',
    phone: '+971 50 444 5566',
    emirate: 'رأس الخيمة',
    clientFeedback: 'لم يستجب للعديد من مكالماتنا ورسائل البريد الإلكتروني رغم اهتمامه الأولي.',
    partnerFeedback: 'تم إغلاق الفرصة مؤقتاً لعدم الرد والاستجابة المتكررة.',
    status: 'لم يتم التنفيذ',
    addDate: '2026-05-01',
    lastContact: '2026-06-02',
    nextFollowup: '2026-08-01',
    interestLevel: 'منخفض',
    contactCount: 6,
    notDoneReason: 'عدم الرد على الاتصالات المتكررة',
    owner: 'فاطمة الحوسني',
    ownerEmail: 'fatima@gems.com'
  },
  {
    id: 'GEMS-1008',
    name: 'منيرة المرزوقي',
    company: 'الفجيرة للتطوير السياحي',
    phone: '+971 56 777 8899',
    emirate: 'الفجيرة',
    clientFeedback: 'طلبت تعديلات على نموذج الفوترة ليكون ربع سنوي بدلاً من سنوي.',
    partnerFeedback: 'تمت الموافقة من الإدارة على الفوترة الربع سنوية وجاري إرسال مسودة العقد المحدثة.',
    status: 'متابعة',
    addDate: '2026-06-15',
    lastContact: '2026-06-18',
    nextFollowup: '2026-06-22',
    interestLevel: 'عالي',
    contactCount: 1,
    owner: 'فاطمة الحوسني',
    ownerEmail: 'fatima@gems.com'
  },
  {
    id: 'GEMS-1009',
    name: 'حميد الزعابي',
    company: 'أم القيوين للتجارة والاستثمار',
    phone: '+971 55 111 2233',
    emirate: 'أم القيوين',
    clientFeedback: 'تم التوقيع الإلكتروني وتأسيس خادم السحاب للعميل.',
    partnerFeedback: 'البدء بتدريب فريق العمل لديهم الأسبوع المقبل.',
    status: 'نفذ',
    addDate: '2026-05-28',
    lastContact: '2026-06-15',
    nextFollowup: '2026-06-25',
    interestLevel: 'عالي',
    contactCount: 3,
    owner: 'يوسف العلي',
    ownerEmail: 'youssef@gems.com'
  },
  {
    id: 'GEMS-1010',
    name: 'راشد النعيمي',
    company: 'النعيمي للمقاولات العامة',
    phone: '+971 52 333 4455',
    emirate: 'عجمان',
    clientFeedback: 'الأسعار مرتفعة مقارنة بالمنافسين المحليين ويريد خصماً إضافياً 30%.',
    partnerFeedback: 'الحد الأقصى للخصم المتاح هو 15%، سنقدم له دعم فني مجاني كبديل لتخفيض السعر.',
    status: 'متابعة',
    addDate: '2026-06-05',
    lastContact: '2026-06-14',
    nextFollowup: '2026-06-20',
    interestLevel: 'متوسط',
    contactCount: 2,
    owner: 'يوسف العلي',
    ownerEmail: 'youssef@gems.com'
  }
];
