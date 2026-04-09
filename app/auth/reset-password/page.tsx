import React from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="max-w-sm mx-auto mt-12 p-6">Loading...</div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
