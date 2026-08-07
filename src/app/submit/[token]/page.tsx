import React from 'react';
import SubmitPageClient from './SubmitPageClient';

export async function generateStaticParams() {
  return [
    { token: 'req-token-hydraulic-diag' },
    { token: 'req-token-newhire-problems' },
    { token: 'demo-request-token' }
  ];
}

export default function SubmitTokenPage() {
  return <SubmitPageClient />;
}
