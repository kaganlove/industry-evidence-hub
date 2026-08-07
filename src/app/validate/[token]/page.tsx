import React from 'react';
import ValidatePageClient from './ValidatePageClient';

export async function generateStaticParams() {
  return [
    { token: 'val-token-hydraulic-ma' }
  ];
}

export default function ValidateTokenPage() {
  return <ValidatePageClient />;
}
