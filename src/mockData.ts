/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, User } from './types';

/// حسابات المشرفين والمدراء المعتمدين للنظام
export const USERS: User[] = [
  { username: 'saad_gems', name: 'سعد أبو جبل', email: 'saadabugabl@gmail.com', role: 'admin' },
  { username: 'naji_gems', name: 'ناجي بن محمد', email: 'naji93793@gmail.com', role: 'admin' }
];

// كلمات المرور الافتراضية المؤمنة
export const USER_PASSWORDS: Record<string, string> = {
  'saad_gems': '11223344',
  'naji_gems': '11223344',
  'saadabugabl@gmail.com': '11223344',
  'naji93793@gmail.com': '11223344',
  'admin': '11223344'
};

// البيانات الأولية الفارغة لبدء ملفات العملاء الفعليين
export const INITIAL_CLIENTS: Client[] = [];
