import Navbar from '@/components/Navbar';
import GalleryGrid from '@/components/GalleryGrid';
import { supabase } from '@/lib/supabase';
import type { Painting } from '@/types/painting';

async function getPaintings(): Promise<Painting[]> {
  const { data, error } = await supabase
    .from('paintings')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching paintings:', error);
    return [];
  }

  return data || [];
}

export const revalidate = 0; // Disable cache for instant updates

export default async function Home() {
  const paintings = await getPaintings();

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-[calc(var(--nav-height)+32px)]">
        {/* Hero Section */}
        <section className="px-4 md:px-8 lg:px-12 py-12 md:py-20">
          <div className="max-w-7xl mx-auto">
            <header className="text-center mb-12 md:mb-16">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 opacity-0 animate-fade-in">
                IvoGarcia Arte
              </h1>
              <p className="text-[var(--color-text-muted)] text-lg md:text-xl max-w-2xl mx-auto opacity-0 animate-fade-in stagger-1">
                Uma coleção de pinturas criadas com a arte tradicional da aguarela,
                capturando a beleza efémera da luz e da cor.
              </p>
            </header>

            {paintings.length === 0 ? (
              <div className="text-center py-20 glass-card p-12">
                <p className="text-[var(--color-text-muted)] text-lg mb-4">
                  A galeria ainda não tem pinturas.
                </p>
                <a href="/admin" className="btn-primary inline-block">
                  Adicionar Primeira Pintura
                </a>
              </div>
            ) : (
              <GalleryGrid paintings={paintings} />
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 md:px-8 lg:px-12 py-8 border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto text-center text-[var(--color-text-muted)] text-sm">
            <p>© {new Date().getFullYear()} IvoGarcia Arte. Todos os direitos reservados.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
