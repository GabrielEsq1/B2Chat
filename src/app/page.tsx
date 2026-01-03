"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    MessageSquare, Users, Zap, TrendingUp, Clock, Shield,
    Check, ArrowRight, Play, Star, Building2, Megaphone,
    ChevronLeft, ChevronRight, ArrowDown
} from "lucide-react";
import BlogSection from "@/components/home/BlogSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BookingBanner from "@/components/dashboard/BookingBanner";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [videoPlaying, setVideoPlaying] = useState(false);

    // Cast benefits to array to avoid TypeScript errors if type inference fails
    const benefits = (t('home.benefits') as unknown as any[]).map((b, i) => ({
        ...b,
        icon: [
            <TrendingUp key="trend" className="h-6 w-6" />,
            <Users key="users" className="h-6 w-6" />,
            <Zap key="zap" className="h-6 w-6" />,
            <Megaphone key="mega" className="h-6 w-6" />,
            <Building2 key="build" className="h-6 w-6" />,
            <Shield key="shield" className="h-6 w-6" />
        ][i]
    }));

    const testimonials = t('home.testimonials') as unknown as any[];

    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);


    const steps = (t('home.steps') as unknown as any[]).map((s, i) => ({
        ...s,
        number: (i + 1).toString()
    }));

    // Safe access for ecosystem arrays
    const b2bBenefits = (t('ecosystem.b2bchat.benefits') as unknown as string[]) || [];
    const b2bBadges = (t('ecosystem.b2bchat.badges') as unknown as string[]) || [];
    const creaBenefits = (t('ecosystem.creatiendas.benefits') as unknown as string[]) || [];
    const creaBadges = (t('ecosystem.creatiendas.badges') as unknown as string[]) || [];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-blue-200 shadow-lg">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-900 leading-none tracking-tight">B2BChat</span>
                                <Link href="/hub" className="text-[11px] text-gray-500 hover:text-blue-600 font-medium mt-0.5 tracking-wide transition-colors">
                                    {t('ecosystem.seal')}
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            <div className="hidden md:flex items-center gap-3">
                                <button
                                    onClick={() => router.push('/login')}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 font-semibold transition-colors"
                                >
                                    {t('auth.login_btn')}
                                </button>
                                <button
                                    onClick={() => router.push('/register')}
                                    className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl"
                                >
                                    {t('auth.register_btn')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - ABOVE THE FOLD */}
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Value Prop */}
                        <div className="text-left relative z-10">
                            <div className="inline-flex flex-col sm:flex-row items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    {t('home.trusted_by')}
                                </div>
                                <BookingBanner />
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                                {t('home.hero_title')}
                            </h1>

                            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                {t('home.hero_subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                                <button
                                    onClick={() => router.push('/register')}
                                    className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 text-lg"
                                >
                                    {t('home.cta_primary')}
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setVideoPlaying(true)}
                                    className="px-8 py-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-lg shadow-sm"
                                >
                                    <Play className="h-5 w-5 fill-current" />
                                    {t('home.cta_secondary')}
                                </button>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400">
                                <div className="flex items-center gap-1.5">
                                    <Check className="h-4 w-4 text-green-500 stroke-[3]" />
                                    <span>{t('home.hero_check1')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Check className="h-4 w-4 text-green-500 stroke-[3]" />
                                    <span>{t('home.hero_check2')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Check className="h-4 w-4 text-green-500 stroke-[3]" />
                                    <span>{t('home.hero_check3')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Product Mockup */}
                        <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
                            <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-200/50 rounded-full blur-[100px] -z-10"></div>
                            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-purple-200/50 rounded-full blur-[100px] -z-10"></div>

                            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-transform hover:scale-[1.01] duration-500">
                                <div className="bg-gray-50/50 p-6 min-h-[450px] flex flex-col">
                                    {/* Chat Header */}
                                    <div className="flex items-center gap-4 pb-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm -mx-6 -mt-6 p-6 sticky top-0 z-10">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            TC
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 text-lg">TechCorp Solutions</h3>
                                                <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-bold uppercase tracking-wider">
                                                    ✓ {t('home.mockup.verified')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">{t('home.mockup.industry')}</p>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 py-6 space-y-6">
                                        <div className="flex gap-3">
                                            <div className="bg-white rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm border border-gray-100 max-w-[85%]">
                                                <p className="text-sm text-gray-700 leading-relaxed">{t('home.mockup.msg1')}</p>
                                                <span className="text-[10px] text-gray-400 mt-1.5 block font-medium">10:23 AM</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-5 py-3.5 shadow-lg shadow-blue-500/20 max-w-[85%]">
                                                <p className="text-sm leading-relaxed">{t('home.mockup.msg2')}</p>
                                                <span className="text-[10px] text-blue-100 mt-1.5 block font-medium">10:24 AM</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="bg-white rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm border border-gray-100 max-w-[85%] relative group cursor-pointer hover:border-blue-200 transition-colors">
                                                <div className="absolute -top-2.5 -right-2.5 px-2 py-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] rounded-full font-bold shadow-sm">
                                                    ✨ {t('home.mockup.ai_tag')}
                                                </div>
                                                <div className="flex gap-1.5 mb-1">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 block font-medium group-hover:text-blue-500 transition-colors uppercase tracking-wide">{t('home.mockup.typing')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-center text-xs text-gray-400 font-semibold pt-4 border-t border-gray-100 uppercase tracking-widest">
                                        {t('home.mockup.footer')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ecosystem Section - NEW DESIGN */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-24 cursor-default">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest mb-8 shadow-xl">
                            <Building2 className="w-3.5 h-3.5 text-blue-400" />
                            {t('ecosystem.seal')}
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                            {t('ecosystem.title_main')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">{t('ecosystem.title_highlight')}</span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            {t('ecosystem.subtitle')}
                        </p>
                    </div>

                    {/* Cards Container */}
                    <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 lg:gap-0 max-w-6xl mx-auto">

                        {/* B2BChat Card */}
                        <div className="flex-1 bg-slate-50 rounded-3xl p-10 lg:p-12 border border-slate-100 shadow-xl lg:mr-[-20px] lg:z-10 hover:z-30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                    <MessageSquare className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-900">{t('ecosystem.b2bchat.title')}</h3>
                                    <p className="text-blue-600 font-medium">{t('ecosystem.b2bchat.tagline')}</p>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10">
                                {b2bBenefits.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 min-w-[20px]">
                                            <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                        <p className="text-slate-700 font-medium leading-snug">{item}</p>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-wrap gap-2">
                                {b2bBadges.map((badge, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Transition Arrow - Desktop */}
                        <div className="hidden lg:flex flex-col items-center justify-center z-20 w-40 relative">
                            <div className="absolute inset-0 bg-white/50 blur-xl"></div>
                            <div className="relative bg-white p-4 rounded-full shadow-lg border border-slate-100">
                                <ArrowRight className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="absolute -bottom-12 w-48 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {t('ecosystem.transition_text')}
                            </p>
                        </div>

                        {/* Transition Arrow - Mobile */}
                        <div className="lg:hidden flex flex-col items-center justify-center gap-2 text-slate-400">
                            <ArrowDown className="w-8 h-8" />
                            <p className="text-xs font-bold uppercase tracking-wider">{t('ecosystem.transition_text')}</p>
                        </div>


                        {/* CreaTiendas Card */}
                        <div
                            className="flex-1 bg-white rounded-3xl p-10 lg:p-12 border border-slate-200 shadow-xl lg:ml-[-20px] lg:z-10 hover:z-30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative overflow-hidden"
                            onClick={() => window.open('https://creatiendasgit1.vercel.app/', '_blank')}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-[#22C55E] flex items-center justify-center shadow-lg shadow-green-200">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-slate-900">{t('ecosystem.creatiendas.title')}</h3>
                                        <p className="text-green-600 font-medium">{t('ecosystem.creatiendas.tagline')}</p>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {creaBenefits.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 min-w-[20px]">
                                                <Check className="w-5 h-5 text-green-500" />
                                            </div>
                                            <p className="text-slate-700 font-medium leading-snug">{item}</p>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {creaBadges.map((badge, i) => (
                                        <span key={i} className="px-3 py-1 bg-green-50 border border-green-100 rounded-full text-xs font-bold text-green-700 uppercase tracking-wide">
                                            {badge}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center text-[#22C55E] font-bold group-hover:gap-3 transition-all duration-300">
                                    {t('home.visit_hub')} <ArrowRight className="w-5 h-5 ml-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Footer Context */}
                    <div className="mt-24 text-center max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">
                            {t('ecosystem.footer.title_part1')} <span className="text-green-600">{t('ecosystem.footer.title_highlight1')}</span> {t('ecosystem.footer.title_part2')} <span className="text-slate-900 border-b-4 border-blue-500">{t('ecosystem.footer.title_highlight2')}</span>
                        </h3>
                        <p className="text-lg text-slate-500 mb-10">
                            {t('ecosystem.footer.subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => window.open('https://creatiendasgit1.vercel.app/', '_blank')}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#22C55E] text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                            >
                                <Building2 className="w-5 h-5" />
                                {t('ecosystem.footer.cta_store')}
                            </button>
                            <button
                                onClick={() => router.push('/register')}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                {t('ecosystem.footer.cta_b2b')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 bg-slate-50 border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        <div className="p-4">
                            <div className="text-4xl font-black text-blue-600 mb-2 tracking-tight">1,000+</div>
                            <div className="text-gray-600 font-medium uppercase tracking-wider text-sm">{t('home.social_proof.companies')}</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl font-black text-blue-600 mb-2 tracking-tight">40%</div>
                            <div className="text-gray-600 font-medium uppercase tracking-wider text-sm">{t('home.social_proof.closures')}</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl font-black text-blue-600 mb-2 tracking-tight">75%</div>
                            <div className="text-gray-600 font-medium uppercase tracking-wider text-sm">{t('home.social_proof.time')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
                            {t('home.benefits_title')}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            {t('home.benefits_subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit: any, index: number) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        {benefit.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg">{benefit.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{benefit.desc}</p>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                            <TrendingUp className="h-3 w-3" />
                                            {benefit.metric}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to Start Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
                            {t('home.how_it_works_title')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('home.how_it_works_subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-200 -z-10 transform translate-y-4"></div>

                        {steps.map((step: any, index: number) => (
                            <div key={index} className="relative bg-slate-50">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-gray-200 text-blue-600 text-3xl font-black mb-6 shadow-md mx-auto relative z-10">
                                        {step.number}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <ArrowRight className="hidden md:block absolute top-[2.5rem] -right-6 h-6 w-6 text-gray-300 z-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-16">
                        <p className="text-sm text-gray-500 mb-8 font-medium">
                            {t('home.cta_final_hint')}
                        </p>
                        <button
                            onClick={() => router.push('/register')}
                            className="px-10 py-5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all hover:scale-105 inline-flex items-center gap-2 shadow-xl shadow-blue-500/20 text-lg"
                        >
                            {t('home.cta_final_btn')}
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonial Carousel */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-center font-black mb-4 text-blue-600 uppercase tracking-[0.3em] text-xs">
                            {t('home.testimonials_title')}
                        </h2>
                        <h3 className="text-4xl font-extrabold text-gray-900">{t('home.testimonials_subtitle')}</h3>
                    </div>

                    <div className="relative group">
                        {/* Carousel Content */}
                        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-[2.5rem] p-10 md:p-16 min-h-[400px] flex flex-col justify-center transition-all duration-500 border border-gray-100 shadow-2xl">
                            <div className="absolute top-10 left-10 text-blue-100">
                                <svg className="w-24 h-24 fill-current opacity-30" viewBox="0 0 24 24">
                                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L21.017 3V15C21.017 18.3137 18.3307 21 15.017 21H14.017ZM3.0166 21L3.0166 18C3.0166 16.8954 3.91203 16 5.0166 16H8.0166C8.56888 16 9.0166 15.5523 9.0166 15V9C9.0166 8.44772 8.56888 8 8.0166 8H5.0166C3.91203 8 3.0166 7.10457 3.0166 6V3L10.0166 3V15C10.0166 18.3137 7.3303 21 4.0166 21H3.0166Z" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <div className="flex gap-1 mb-8 justify-center md:justify-start">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                                    ))}
                                </div>

                                <div className="animate-in fade-in slide-in-from-right-8 duration-700" key={currentTestimonial}>
                                    <blockquote className="text-2xl md:text-3xl text-gray-800 font-medium mb-12 leading-relaxed text-center md:text-left">
                                        "{testimonials[currentTestimonial].text}"
                                    </blockquote>

                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-gray-100">
                                            {testimonials[currentTestimonial].name[0]}
                                        </div>
                                        <div className="text-center md:text-left">
                                            <div className="font-black text-gray-900 text-lg">{testimonials[currentTestimonial].name}</div>
                                            <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mt-1">{testimonials[currentTestimonial].role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex justify-between absolute top-1/2 left-0 right-0 w-full px-2 transform -translate-y-1/2 pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); prevTestimonial(); }}
                                className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:scale-110 transition-all border border-gray-100 -ml-6 md:-ml-8"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextTestimonial(); }}
                                className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:scale-110 transition-all border border-gray-100 -mr-6 md:-mr-8"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-3 mt-10">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentTestimonial(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentTestimonial ? 'w-10 bg-blue-600 shadow-md' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section - Simplified */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-lg font-bold text-gray-400 mb-8 uppercase tracking-widest">
                        {t('home.about_title')}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center gap-3 group">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Shield className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{t('home.about_items.security')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 group">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{t('home.about_items.b2b')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 group">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{t('home.about_items.network')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 group">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Zap className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{t('home.about_items.integration')}</span>
                        </div>
                    </div>
                </div>
            </section>

            <BlogSection />

            {/* Final CTA */}
            <section className="py-24 bg-blue-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[100px] opacity-50 translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                        {t('home.cta_final_title')}
                    </h2>
                    <p className="text-xl text-blue-100 mb-12 font-medium">
                        {t('home.cta_final_subtitle')}
                    </p>
                    <button
                        onClick={() => router.push('/register')}
                        className="px-12 py-6 rounded-2xl bg-white text-blue-600 font-black hover:bg-gray-50 transition-all hover:scale-105 inline-flex items-center gap-3 shadow-2xl text-xl"
                    >
                        {t('home.cta_final_btn')}
                        <ArrowRight className="h-6 w-6" />
                    </button>
                    <p className="text-blue-200 text-sm mt-8 font-medium tracking-wide">
                        {t('home.cta_final_hint')}
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">B2BChat</span>
                        </div>
                        <p className="text-sm font-medium">© 2025 B2BChat. {t('home.footer_rights')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
