import { notFound } from 'next/navigation';
import { ChapterView } from '@/components/workspace/WorkspaceViews';
const slugs = ['baseline', 'pre-storm', 'reuse', 'canal-release', 'results'];
export default function Page({ params }: { params: { slug: string } }) {
  if (!slugs.includes(params.slug)) notFound();
  return <ChapterView slug={params.slug} />;
}
