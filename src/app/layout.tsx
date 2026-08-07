import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Industry Evidence Hub | Build curriculum from the work itself',
  description:
    'A workplace evidence repository and curriculum traceability system. Capture workplace tasks, checklists, and documents, then trace them to courses, competencies, and mastery assessments.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
