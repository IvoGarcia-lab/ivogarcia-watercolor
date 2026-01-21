import Navbar from '@/components/Navbar';
import { Paintbrush, Heart, Award, BookOpen } from 'lucide-react';

export const metadata = {
    title: 'Sobre o Autor | Aquarela Vivida',
    description: 'Conheça o artista por trás das aguarelas e a sua jornada artística.',
};

export default function AuthorPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen pt-[calc(var(--nav-height)+32px)]">
                <div className="px-4 md:px-8 lg:px-12 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Hero Section */}
                        <header className="text-center mb-16">
                            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
                                Sobre o Autor
                            </h1>
                            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
                                A arte de capturar a luz e a emoção através da aguarela
                            </p>
                        </header>

                        {/* Biography Card */}
                        <div className="glass-card p-8 md:p-12 mb-12">
                            <div className="prose prose-lg max-w-none">
                                <h2 className="font-heading text-3xl font-semibold mb-6 text-[var(--color-text)]">
                                    A Minha Jornada
                                </h2>
                                <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                                    A aguarela sempre foi, para mim, uma forma de diálogo silencioso com a natureza.
                                    Cada pincelada é uma tentativa de capturar não apenas o que vejo, mas o que sinto
                                    perante a beleza efémera do mundo que nos rodeia.
                                </p>
                                <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                                    Comecei a pintar há mais de duas décadas, fascinado pela forma como a água
                                    transporta o pigmento, criando efeitos únicos e irrepetíveis. Cada obra é
                                    uma colaboração entre a minha intenção e o comportamento imprevisível da
                                    água sobre o papel.
                                </p>
                                <p className="text-[var(--color-text-muted)] leading-relaxed">
                                    As minhas inspirações vêm das paisagens portuguesas, da luz mediterrânica,
                                    e da tradição dos mestres aguarelistas ingleses que tanto admiro.
                                </p>
                            </div>
                        </div>

                        {/* Values Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            <div className="glass-card p-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                                    <Paintbrush className="w-6 h-6 text-[var(--color-primary)]" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-2">Técnica</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    Trabalho exclusivamente com aguarela em técnicas húmidas e secas,
                                    explorando a transparência única deste medium.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                                    <Heart className="w-6 h-6 text-[var(--color-primary)]" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-2">Paixão</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    Cada pintura nasce de uma emoção genuína, seja a serenidade de uma
                                    manhã de nevoeiro ou a energia de um pôr-do-sol.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                                    <Award className="w-6 h-6 text-[var(--color-primary)]" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-2">Reconhecimento</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    As minhas obras fazem parte de coleções privadas em Portugal,
                                    Espanha, França e Reino Unido.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-[var(--color-primary)]" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-2">Ensino</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    Partilho regularmente o meu conhecimento através de workshops
                                    e demonstrações para aspirantes a aguarelistas.
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
