'use client';

import Navbar from '@/components/Navbar';
import { Droplets, Layers, Timer, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useAutoScroll } from '@/hooks/useAutoScroll';

export default function ProcessPage() {
    useAutoScroll(true, 5000, 0.5); // Idle 5s, Speed 0.5
    const [processContent, setProcessContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const { data } = await supabase
                    .from('site_content')
                    .select('content')
                    .eq('slug', 'process-intro')
                    .single();

                if (data) {
                    setProcessContent(data.content);
                }
            } catch (err) {
                console.error('Error fetching process content:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, []);

    return (
        <>
            <Navbar />

            <main className="min-h-screen pt-[calc(var(--nav-height)+32px)]">
                <div className="px-4 md:px-8 lg:px-12 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Hero Section */}
                        <header className="text-center mb-16">
                            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
                                Processo & Técnica
                            </h1>
                            {loading ? (
                                <div className="h-6 bg-[var(--color-border)] rounded w-2/3 mx-auto animate-pulse"></div>
                            ) : (
                                <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto whitespace-pre-wrap">
                                    {processContent || "A arte milenar da aguarela: transparência, fluidez e emoção"}
                                </p>
                            )}
                        </header>

                        {/* Steps - Zig Zag Layout */}
                        <div className="space-y-24 mb-32">
                            {/* Step 1 */}
                            <div className="grid md:grid-cols-2 gap-12 items-center group">
                                <div className="relative order-2 md:order-1 h-64 md:h-80 rounded-2xl overflow-hidden glass-card p-2 rotate-1 group-hover:rotate-0 transition-transform duration-700">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                                        <div className="absolute inset-0 bg-black/10 z-10"></div>
                                        <img src="/images/process/process-1.png" alt="Esboço e Preparação" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                                    </div>
                                    <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-heading text-2xl font-bold shadow-lg z-20">1</div>
                                </div>
                                <div className="order-1 md:order-2">
                                    <h3 className="font-heading text-3xl font-light mb-6 flex items-center gap-4">
                                        <span className="w-12 h-[1px] bg-[var(--color-primary)]"></span>
                                        Preparação
                                    </h3>
                                    <p className="text-[var(--color-text-muted)] leading-relaxed text-lg font-light">
                                        Cada obra começa com a seleção cuidadosa do papel. Utilizo exclusivamente
                                        papéis 100% algodão com gramagem superior a 300g/m², que permitem trabalhar
                                        com múltiplas camadas de água sem deformar. O esboço inicial é minimalista,
                                        apenas um sussurro de grafite para guiar a luz.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="grid md:grid-cols-2 gap-12 items-center group">
                                <div className="order-1">
                                    <h3 className="font-heading text-3xl font-light mb-6 flex items-center gap-4">
                                        <span className="w-12 h-[1px] bg-[var(--color-primary)]"></span>
                                        Composição
                                    </h3>
                                    <p className="text-[var(--color-text-muted)] leading-relaxed text-lg font-light">
                                        Antes de detalhar, defino as grandes massas de cor e luz.
                                        Na aguarela, é crucial planear onde ficarão os brancos,
                                        pois são as zonas mais luminosas do papel e não podem ser recuperadas.
                                        É um jogo de estratégia e fluidez.
                                    </p>
                                </div>
                                <div className="relative order-2 h-64 md:h-80 rounded-2xl overflow-hidden glass-card p-2 -rotate-1 group-hover:rotate-0 transition-transform duration-700">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                                        <div className="absolute inset-0 bg-black/10 z-10"></div>
                                        <img src="/images/process/process-2.png" alt="Composição e Manchas" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                                    </div>
                                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-[var(--color-secondary)] text-white flex items-center justify-center font-heading text-2xl font-bold shadow-lg z-20">2</div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="grid md:grid-cols-2 gap-12 items-center group">
                                <div className="relative order-2 md:order-1 h-64 md:h-80 rounded-2xl overflow-hidden glass-card p-2 rotate-1 group-hover:rotate-0 transition-transform duration-700">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                                        <div className="absolute inset-0 bg-black/10 z-10"></div>
                                        <img src="/images/process/process-3.png" alt="Execução Húmida" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                                    </div>
                                    <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-heading text-2xl font-bold shadow-lg z-20">3</div>
                                </div>
                                <div className="order-1 md:order-2">
                                    <h3 className="font-heading text-3xl font-light mb-6 flex items-center gap-4">
                                        <span className="w-12 h-[1px] bg-[var(--color-primary)]"></span>
                                        Pintura
                                    </h3>
                                    <p className="text-[var(--color-text-muted)] leading-relaxed text-lg font-light">
                                        Trabalho tipicamente do claro para o escuro, construindo camadas
                                        transparentes que se sobrepõem (glazing). Utilizo a técnica húmido-sobre-húmido
                                        para efeitos atmosféricos, deixando a água pintar por si mesma.
                                        É uma dança entre o controlo do pincel e o caos da água.
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="grid md:grid-cols-2 gap-12 items-center group">
                                <div className="order-1">
                                    <h3 className="font-heading text-3xl font-light mb-6 flex items-center gap-4">
                                        <span className="w-12 h-[1px] bg-[var(--color-primary)]"></span>
                                        Finalização
                                    </h3>
                                    <p className="text-[var(--color-text-muted)] leading-relaxed text-lg font-light">
                                        Após a secagem completa, acrescento os detalhes finais com pincel seco
                                        ou guache branco para realçar contrastes. A aguarela exige saber quando parar
                                        — o excesso de trabalho pode destruir a frescura e espontaneidade que tornam este medium único.
                                        A obra está concluída quando "respira" por si mesma.
                                    </p>
                                </div>
                                <div className="relative order-2 h-64 md:h-80 rounded-2xl overflow-hidden glass-card p-2 -rotate-1 group-hover:rotate-0 transition-transform duration-700">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                                        <div className="absolute inset-0 bg-black/10 z-10"></div>
                                        <img src="/images/process/process-4.png" alt="Detalhes Finais" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                                    </div>
                                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-[var(--color-secondary)] text-white flex items-center justify-center font-heading text-2xl font-bold shadow-lg z-20">4</div>
                                </div>
                            </div>
                        </div>

                        {/* Characteristics */}
                        <h2 className="font-heading text-3xl font-semibold text-center mb-8">
                            Características da Aguarela
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 text-center">
                                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Droplets className="w-7 h-7 text-blue-500" />
                                </div>
                                <h3 className="font-heading text-lg font-semibold mb-2">Transparência</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    A luz atravessa as camadas de pigmento e reflete no papel branco,
                                    criando uma luminosidade impossível de replicar noutros mediums.
                                </p>
                            </div>

                            <div className="glass-card p-6 text-center">
                                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Layers className="w-7 h-7 text-purple-500" />
                                </div>
                                <h3 className="font-heading text-lg font-semibold mb-2">Camadas</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    Cada camada adiciona profundidade e complexidade, permitindo
                                    criar gradações subtis e efeitos atmosféricos.
                                </p>
                            </div>

                            <div className="glass-card p-6 text-center">
                                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Timer className="w-7 h-7 text-amber-500" />
                                </div>
                                <h3 className="font-heading text-lg font-semibold mb-2">Imediatismo</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    As decisões devem ser rápidas. Uma vez aplicada, a cor não
                                    pode ser facilmente corrigida, exigindo confiança e experiência.
                                </p>
                            </div>

                            <div className="glass-card p-6 text-center">
                                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-7 h-7 text-green-500" />
                                </div>
                                <h3 className="font-heading text-lg font-semibold mb-2">Acidente Feliz</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    A água cria efeitos imprevisíveis que frequentemente superam
                                    as intenções do artista, tornando cada obra única.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="px-4 md:px-8 lg:px-12 py-8 border-t border-[var(--color-border)]">
                    <div className="max-w-7xl mx-auto text-center text-[var(--color-text-muted)] text-sm">
                        <p>© {new Date().getFullYear()} Aquarela Vivida. Todos os direitos reservados.</p>
                    </div>
                </footer>
            </main>
        </>
    );
}
