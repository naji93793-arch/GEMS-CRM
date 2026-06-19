/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Client {
  id: string; // معرف العميل
  name: string; // اسم العميل
  company: string; // اسم الشركة
  phone: string; // رقم التليفون
  emirate: string; // الإمارة
  clientFeedback: string; // إفادة العميل
  partnerFeedback: string; // إفادة الشريك
  status: 'العملاء المحتملون' | 'الفرص' | 'المؤهلون' | 'تقديم العرض' | 'التفاوض' | 'نفذ' | 'لم يتم التنفيذ'; // مراحل الـ CRM السبعة
  addDate: string; // تاريخ إضافة العميل
  lastContact: string; // آخر تواصل
  nextFollowup: string; // موعد المتابعة القادمة
  interestLevel: 'عالي' | 'متوسط' | 'منخفض'; // درجة اهتمام العميل
  contactCount: number; // عدد مرات التواصل
  notDoneReason?: string; // سبب عدم التنفيذ
  owner: string; // المسؤول عن العميل
  ownerEmail: string; // بريد المسؤول
  avatar?: string; // صورة العميل
}

export interface User {
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  avatar?: string; // صورة المستخدم الشخصية
}
