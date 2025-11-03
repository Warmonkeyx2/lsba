import type { Boxer } from '@/types/boxer';

export const LICENSE_FEE = 10000;

export function isLicenseValid(boxer: Boxer): boolean {
  if (boxer.licenseStatus === 'suspended') {
    return false;
  }

  const lastPayment = new Date(boxer.lastPaymentDate);
  const now = new Date();
  
  const monthsSincePayment = 
    (now.getFullYear() - lastPayment.getFullYear()) * 12 +
    (now.getMonth() - lastPayment.getMonth());

  return monthsSincePayment < 1;
}

export function getDaysUntilDue(boxer: Boxer): number {
  const lastPayment = new Date(boxer.lastPaymentDate);
  const dueDate = new Date(lastPayment);
  dueDate.setMonth(dueDate.getMonth() + 1);
  
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getNextDueDate(boxer: Boxer): Date {
  const lastPayment = new Date(boxer.lastPaymentDate);
  const dueDate = new Date(lastPayment);
  dueDate.setMonth(dueDate.getMonth() + 1);
  return dueDate;
}

export function processPayment(boxer: Boxer): Boxer {
  return {
    ...boxer,
    lastPaymentDate: new Date().toISOString(),
    licenseStatus: 'active',
  };
}

export function updateLicenseStatus(boxer: Boxer): Boxer {
  const isValid = isLicenseValid(boxer);
  
  if (!isValid && boxer.licenseStatus === 'active') {
    return {
      ...boxer,
      licenseStatus: 'expired',
    };
  }
  
  return boxer;
}
