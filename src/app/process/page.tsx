import Navbar from '@/components/Navbar';
import { Droplets, Layers, Timer, Sparkles } from 'lucide-react';

export const metadata = {
    title: 'Processo & Técnica | Aquarela Vivida',
    description: 'Descubra as técnicas tradicionais de aguarela e o processo criativo por trás de cada obra.',
};

export default function ProcessPage() {
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
                            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
                                A arte milenar da aguarela: transparência, fluidez e emoção
                            </p>
                        </header>

                        {/* Steps */}
                        <div className="space-y-8 mb-16">
                            <div className="glass-card p-8 flex gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white shadow-lg">
                                        <span className="font-heading text-2xl font-bold">1</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-heading text-2xl font-semibold mb-3">Preparação</h3>
                                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                                        Cada obra começa com a seleção cuidadosa do papel. Utilizo exclusivamente
                                        papéis 100% algodão com gramagem superior a 300g/m², que permitem trabalhar
                                        com múltiplas camadas de água sem deformar. O papel é humedecido e esticado
                                        sobre uma tábua de madeira para garantir uma superfície perfeitamente plana.
                                    </p>
                                </div>
                            </div>

                            <div className="glass-card p-8 flex gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white shadow-lg">
                                        <span className="font-heading text-2xl font-bold">2</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-heading text-2xl font-semibold mb-3">Composição</h3>
                                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                                        Antes de tocar no pincel, passo horas a observar o motivo. Faço esboços
                                        rápidos para capturar a essência da composição, identificando as áreas
                                        de luz e sombra. Na aguarela, é crucial planear onde ficarão os brancos,
                                        pois são as zonas mais luminosas e não podem ser recuperadas.
                                    </p>
                                </div>
                            </div>

                            <div className="glass-card p-8 flex gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white shadow-lg">
                                        <span className="font-heading text-2xl font-bold">3</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-heading text-2xl font-semibold mb-3">Pintura</h3>
                                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                                        Trabalho tipicamente do claro para o escuro, construindo camadas
                                        transparentes que se sobrepõem. Utilizo tanto a técnica húmido-sobre-húmido
                                        para efeitos suaves e atmosféricos, como húmido-sobre-seco para detalhes
                                        mais definidos. A magia acontece quando a água e o pigmento interagem
                                        de formas inesperadas.
                                    </p>
                                </div>
                            </div>

                            <div className="glass-card p-8 flex gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white shadow-lg">
                                        <span className="font-heading text-2xl font-bold">4</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-heading text-2xl font-semibold mb-3">Finalização</h3>
                                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                                        Após a última camada secar completamente, avalio a obra como um todo.
                                        Por vezes, é necessário intensificar uma sombra ou suavizar uma transição.
                                        A aguarela exige saber quando parar — o excesso de trabalho pode destruir
                                        a frescura e espontaneidade que tornam este medium único.
                                    </p>
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
