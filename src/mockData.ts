/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, User } from './types';

/// حساب المشرف العام للنظام
export const USERS: User[] = [
  { username: 'admin', name: 'سعد أبو جبل', email: 'saadabugabl@gmail.com', role: 'admin' }
];

// كلمات المرور الافتراضية للتجربة السهلة
export const USER_PASSWORDS: Record<string, string> = {
  'admin': '11223344'
};

// البيانات الأولية الفارغة لبدء ملفات العملاء الفعليين
export const INITIAL_CLIENTS: Client[] = [];
