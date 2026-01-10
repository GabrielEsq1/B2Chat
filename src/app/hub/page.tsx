"use client";

import { useLanguage } from "@/context/LanguageContext";
import {
    Building2, Briefcase, Globe, TrendingUp, ArrowRight,
    ExternalLink, Mail, Phone as PhoneIcon, MapPin,
    Award, Code, BarChart3, Rocket
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useSession } from "next-auth/react";

export default function HubPage() {
    const { t } = useLanguage();
    const { status } = useSession();

    const experience = [
        {
            company: "BetOnYou | Insurance Agency",
            role: "Full Stack Marketer",
            period: "2025 - 2025",
            desc: "Liderazgo del ecosistema digital completo: estrategia, paid media, automatización y analítica."
        },
        {
            company: "Rocket | Advertising & Marketing",
            role: "Paid Media Manager",
            period: "2024 - 2025",
            desc: "Gestión de presupuestos de $24,000 USD/mes para 8 cuentas internacionales."
        },
        {
            company: "TX Sparks Constructions",
            role: "Full Stack Digital Marketer",
            period: "2024",
            desc: "Incremento significativo de leads calificados y ventas en el sector real estate de Texas."
        },
        {
            company: "Baden Bower",
            role: "SEO Specialist",
            period: "2023",
            desc: "Optimización de artículos para publicaciones globales como Bloomberg y Forbes."
        },
        {
            company: "Puro Estado Físico",
            role: "SEM & SEO Specialist",
            period: "2023 - 2024",
            desc: "Estrategias de Google Ads que superaron retos económicos y aumentaron la competitividad."
        }
    ];

    const portfolio = [
        {
            title: "Creatiendas | Tiendas opensource via Whastapp",
            category: "Open Source SaaS",
            link: "https://www.behance.net/gallery/240789301/Creatiendas-Tiendas-opensource-via-Whastapp",
            image: "/images/projects/creatiendas.png"
        },
        {
            title: "Creadas El Shopify de WhatsApp",
            category: "E-commerce SaaS",
            link: "https://www.behance.net/gallery/240377601/Creadas-El-Shopify-de-WhatsApp-para-latinoamericanos",
            image: "/images/projects/creadas.png"
        },
        {
            title: "EcoGuard | Limpia Tu Ciudad",
            category: "Environmental Tech",
            link: "https://www.behance.net/gallery/240375557/EcoGuard-Limpia-Tu-Ciudad-Gana-Dinero-Real",
            image: "/images/projects/ecoguard.png"
        },
        {
            title: "AirOil Recycler™",
            category: "Industrial Innovation",
            link: "https://www.behance.net/gallery/240080311/AirOil-Recycler-Recuperador-de-Hidrocarburos",
            image: "/images/projects/airoil.png"
        },
        {
            title: "AGUAGEN: Energía Limpia",
            category: "Clean Tech",
            link: "https://www.behance.net/gallery/239946315/AGUAGEN-Energia-al-alcance-de-todos",
            image: "/images/projects/aguagen.png"
        },
        {
            title: "MADOCO XXI Ecommerce",
            category: "Marketing Strategy",
            link: "https://www.behance.net/gallery/240789497/MADOCO-XXI-Ecommerce-direccion-de-marketng-digital",
            image: "/images/projects/madoco.png"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">GNOSIS <span className="text-blue-600">HUB</span></span>
                    </Link>
                    {status === "authenticated" ? (
                        <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Dashboard
                        </Link>
                    ) : (
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            {t('common.back')}
                        </Link>
                    )}
                </div>
            </nav>

            <main className="pt-32 pb-20">
                {/* Hero section */}
                <section className="max-w-7xl mx-auto px-4 mb-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                                <Rocket className="w-3 h-3" />
                                {t('hub.hero_title')}
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8 text-balance">
                                {t('hub.hero_title')}
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
                                {t('hub.hero_subtitle')}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a href="https://wa.me/573026687991" className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2">
                                    Contactar ahora <ArrowRight className="w-4 h-4" />
                                </a>
                                <a href="#portfolio" className="px-8 py-4 border border-gray-200 text-gray-600 rounded-xl font-bold hover:border-gray-900 hover:text-gray-900 transition-all">
                                    Ver Proyectos
                                </a>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-2xl relative group">
                                <Image
                                    src="/images/gabriel-esquivia.jpg"
                                    alt="Gabriel Esquivia"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex flex-col justify-end p-8">
                                    <h2 className="text-white text-3xl font-bold mb-1">{t('hub.ceo_name')}</h2>
                                    <p className="text-blue-400 font-medium">{t('hub.ceo_title')}</p>
                                </div>
                            </div>
                            {/* Floating decorative elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse" />
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" />
                        </div>
                    </div>
                </section>

                {/* Profile Summary */}
                <section className="bg-gray-50 py-24 mb-24">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <Award className="w-12 h-12 text-blue-600 mx-auto mb-8" />
                        <h2 className="text-3xl font-bold mb-8 text-gray-900">Perfil Profesional</h2>
                        <p className="text-xl text-gray-600 leading-relaxed italic">
                            "{t('hub.ceo_summary')}"
                        </p>
                    </div>
                </section>

                {/* Experience Grid */}
                <section className="max-w-7xl mx-auto px-4 mb-24">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('hub.experience_title')}</h2>
                            <p className="text-gray-500">Trayectoria enfocada en resultados y escalabilidad.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <div className="text-2xl font-bold text-blue-600">+7 años</div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Experiencia</div>
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <div className="text-2xl font-bold text-green-600">$24k+</div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Ad Spend Mensual</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {experience.map((exp, i) => (
                            <div key={i} className="p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-xl transition-all group">
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" />
                                    {exp.period}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{exp.company}</h3>
                                <p className="text-sm font-semibold text-gray-500 mb-4">{exp.role}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {exp.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Portfolio Section */}
                <section id="portfolio" className="max-w-7xl mx-auto px-4 pt-12">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('hub.portfolio_title')}</h2>
                        <p className="text-gray-500">Muestras de mi trabajo estratégico en Behance.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {portfolio.map((item, i) => (
                            <a
                                key={i}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block"
                            >
                                <div className="overflow-hidden rounded-2xl mb-6 relative aspect-video shadow-lg">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{item.category}</span>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase mt-1">{item.title}</h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-gray-900 group-hover:border-gray-900 transition-all">
                                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <a
                            href="https://www.behance.net/gabrielesq9d8d"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 font-bold border-b-2 border-transparent hover:border-blue-600 pb-1 transition-all"
                        >
                            Ver Portfolio Completo en Behance <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </section>
            </main>

            {/* Footer Contact */}
            <footer className="bg-gray-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">¿Hablamos de tu próximo proyecto B2B?</h2>
                        <p className="text-gray-400">Escalemos tu negocio bajo el ecosistema GNOSIS.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <span className="text-gray-300 font-medium">gabrielesquivia@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                                <PhoneIcon className="w-5 h-5" />
                            </div>
                            <span className="text-gray-300 font-medium">+57 302 6687 991</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <span className="text-gray-300 font-medium">Cartagena, Colombia</span>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 w-full flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500 font-medium text-center">
                        <p>&copy; 2026 GNOSIS Enterprise Ecosystem. Todos los derechos reservados.</p>
                        <div className="flex gap-6">
                            <a href="https://www.behance.net/gabrielesq9d8d" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Behance</a>
                            <a href="https://wa.me/573026687991" className="hover:text-white transition-colors">WhatsApp</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
