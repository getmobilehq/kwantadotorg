import Header from '@/components/Header';
import Container from '@/components/Container';
import MatchClientPage from '@/components/MatchClientPage';
import MatchNotFound from '@/components/MatchNotFound';
import { getMatch } from '@/lib/api-client';

export async function generateStaticParams() {
  // For MVP, we'll handle this dynamically rather than pre-generating
  // In production, you could query Firebase for all match IDs
  return [];
}

export default async function MatchPage({
  params,
}: {
  params: { matchId: string };
}) {
  try {
    const match = await getMatch(params.matchId);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <Header />
        <Container className="py-12">
          <MatchClientPage initialMatch={match} matchId={params.matchId} />
        </Container>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <Header />
        <Container className="py-12">
          <MatchNotFound />
        </Container>
      </div>
    );
  }
}