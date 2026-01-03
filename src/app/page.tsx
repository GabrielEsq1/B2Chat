"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    MessageSquare, Users, Zap, TrendingUp, Clock, Shield,
    Check, ArrowRight, Play, Star, Building2, Megaphone,
    ChevronLeft, ChevronRight, ArrowDown
} from "lucide-react";
import { useEffect } from "react";
import BlogSection from "@/components/home/BlogSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [videoPlaying, setVideoPlaying] = useState(false);

    const benefits = (t('home.benefits') as unknown as any[]).map((b, i) => ({
        ...b,
        icon: [
            <TrendingUp className="h-6 w-6" />,
            <Users className="h-6 w-6" />,
            <Zap className="h-6 w-6" />,
            <Megaphone className="h-6 w-6" />,
            <Building2 className="h-6 w-6" />,
            <Shield className="h-6 w-6" />
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

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Overlay (Booking Banner) */}
            <div className="bg-gray-50 py-2 border-b border-gray-100 hidden sm:block">
                <div className="max-w-7xl mx-auto px-4 flex justify-center">
                    <button
                        onClick={() => window.open('https://meet.brevo.com/gabriel-esquivia', '_blank')}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                    >
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('home.booking_banner')}</span>
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-white" />
                        </div>
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-gray-900 leading-none">B2BChat</span>
                                <Link href="/hub" className="text-[10px] text-gray-500 hover:text-blue-600 font-medium mt-0.5">
                                    {t('ecosystem.seal')}
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher />
                            <button
                                onClick={() => router.push('/login')}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                {t('auth.login_btn')}
                            </button>
                            <button
                                onClick={() => router.push('/register')}
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                {t('auth.register_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - ABOVE THE FOLD */}
            <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Value Prop */}
                        <div className="text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium mb-6">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                {t('home.trusted_by')}
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                {t('home.hero_title')}
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                                {t('home.hero_subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={() => router.push('/register')}
                                    className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                                >
                                    {t('home.cta_primary')}
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setVideoPlaying(true)}
                                    className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Play className="h-5 w-5" />
                                    {t('home.cta_secondary')}
                                </button>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>{t('home.hero_check1')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>{t('home.hero_check2')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>{t('home.hero_check3')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Product Mockup */}
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full blur-3xl opacity-60"></div>
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-60"></div>

                            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 overflow-hidden">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 min-h-[400px] flex flex-col">
                                    {/* Chat Header */}
                                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                            TC
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">TechCorp Solutions</h3>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                    ✓ {t('home.mockup.verified')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{t('home.mockup.industry')}</p>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 py-4 space-y-4">
                                        <div className="flex gap-2">
                                            <div className="bg-white rounded-lg px-4 py-2 shadow-sm max-w-[80%]">
                                                <p className="text-sm text-gray-700">{t('home.mockup.msg1')}</p>
                                                <span className="text-xs text-gray-400 mt-1 block">10:23 AM</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <div className="bg-blue-600 text-white rounded-lg px-4 py-2 shadow-sm max-w-[80%]">
                                                <p className="text-sm">{t('home.mockup.msg2')}</p>
                                                <span className="text-xs text-blue-100 mt-1 block">10:24 AM</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="bg-white rounded-lg px-4 py-2 shadow-sm max-w-[80%] relative">
                                                <div className="absolute -top-2 -right-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                                    🤖 {t('home.mockup.ai_tag')}
                                                </div>
                                                <p className="text-sm text-gray-700">...</p>
                                                <span className="text-xs text-gray-400 mt-1 block">{t('home.mockup.typing')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-center text-xs text-gray-500 font-medium pt-2 border-t border-gray-200">
                                        {t('home.mockup.footer')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">1,000+</div>
                            <div className="text-gray-600">{t('home.social_proof.companies')}</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">40%</div>
                            <div className="text-gray-600">{t('home.social_proof.closures')}</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">75%</div>
                            <div className="text-gray-600">{t('home.social_proof.time')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            {t('home.benefits_title')}
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {t('home.benefits_subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit: any, index: number) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                        {benefit.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{benefit.desc}</p>
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
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
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            {t('home.how_it_works_title')}
                        </h2>
                        <p className="text-lg text-gray-600">
                            {t('home.how_it_works_subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step: any, index: number) => (
                            <div key={index} className="relative">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                                        {step.number}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600">{step.desc}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <ArrowRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-gray-300" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-sm text-gray-500 mb-6">
                            {t('home.cta_final_hint')}
                        </p>
                        <button
                            onClick={() => router.push('/register')}
                            className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all hover:scale-105 inline-flex items-center gap-2 shadow-lg"
                        >
                            {t('home.cta_final_btn')}
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Ecosystem Section - CREATIENDAS BRANDING */}
            <section className="py-24 bg-[#0F172A] text-white relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-500/20 shadow-sm backdrop-blur-sm">
                            <Building2 className="w-4 h-4" />
                            {t('ecosystem.seal')}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                            GNOSIS: <span className="text-blue-500">A Growing</span> <span className="text-green-500">Ecosystem</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            {t('ecosystem.description')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
                        {/* B2BChat */}
                        <div className="bg-[#1E293B]/50 backdrop-blur-md rounded-3xl p-10 border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500 shadow-xl">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <MessageSquare className="w-32 h-32" />
                            </div>
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-600/20">
                                <MessageSquare className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">B2BChat</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
                                {t('ecosystem.diagram.step1')}
                            </p>
                        </div>

                        {/* Connection Arrow */}
                        <div className="flex flex-col items-center justify-center gap-4 text-gray-600">
                            <div className="hidden md:flex items-center gap-2">
                                <div className="w-16 h-px bg-gradient-to-r from-transparent to-blue-500/50"></div>
                                <ArrowRight className="w-8 h-8 text-blue-500 animate-pulse" />
                                <div className="w-16 h-px bg-gradient-to-l from-transparent to-green-500/50"></div>
                            </div>
                            <div className="md:hidden flex flex-col items-center gap-2 py-4">
                                <ArrowDown className="w-8 h-8 text-blue-500 animate-pulse" />
                            </div>
                        </div>

                        {/* CreaTiendas */}
                        <div
                            className="bg-[#1E293B]/50 backdrop-blur-md rounded-3xl p-10 border border-white/5 relative overflow-hidden group hover:border-[#22C55E]/30 transition-all duration-500 shadow-xl cursor-pointer"
                            onClick={() => window.open('https://creatiendasgit1.vercel.app/', '_blank')}
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Building2 className="w-32 h-32" />
                            </div>
                            <div className="w-14 h-14 bg-[#22C55E] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#22C55E]/20">
                                <Building2 className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">CreaTiendas</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                                {t('ecosystem.diagram.step2')}
                            </p>
                            <div className="flex items-center gap-2 text-[#22C55E] text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                {t('home.visit_hub')} <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial Carousel */}
            <section className="py-20 bg-gray-50 overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-center font-black mb-4 text-blue-600 uppercase tracking-[0.3em] text-xs">
                            {t('home.testimonials_title')}
                        </h2>
                        <h3 className="text-3xl font-bold text-gray-900">{t('home.testimonials_subtitle')}</h3>
                    </div>

                    <div className="relative group">
                        {/* Carousel Content */}
                        <div className="relative bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12 min-h-[350px] flex flex-col justify-center transition-all duration-500">
                            <div className="absolute top-8 left-8 text-blue-100">
                                <svg className="w-20 h-20 fill-current opacity-20" viewBox="0 0 24 24">
                                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L21.017 3V15C21.017 18.3137 18.3307 21 15.017 21H14.017ZM3.0166 21L3.0166 18C3.0166 16.8954 3.91203 16 5.0166 16H8.0166C8.56888 16 9.0166 15.5523 9.0166 15V9C9.0166 8.44772 8.56888 8 8.0166 8H5.0166C3.91203 8 3.0166 7.10457 3.0166 6V3L10.0166 3V15C10.0166 18.3137 7.3303 21 4.0166 21H3.0166Z" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <div className="flex gap-1 mb-8">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                <div className="animate-in fade-in slide-in-from-right-8 duration-700" key={currentTestimonial}>
                                    <blockquote className="text-xl md:text-2xl text-gray-800 font-medium mb-10 italic leading-relaxed">
                                        "{testimonials[currentTestimonial].text}"
                                    </blockquote>

                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                                            {testimonials[currentTestimonial].name[0]}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 text-lg">{testimonials[currentTestimonial].name}</div>
                                            <div className="text-sm font-bold text-blue-600 uppercase tracking-wider">{testimonials[currentTestimonial].role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevTestimonial}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-12 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:scale-110 transition-all border border-gray-100 z-20 md:opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            onClick={nextTestimonial}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-12 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:scale-110 transition-all border border-gray-100 z-20 md:opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        {/* Dots */}
                        <div className="flex justify-center gap-3 mt-10">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentTestimonial(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentTestimonial ? 'w-10 bg-blue-600 shadow-lg shadow-blue-200' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section - Simplified */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {t('home.about_title')}
                    </h2>
                    <div className="grid md:grid-cols-4 gap-6 mt-8">
                        <div className="flex flex-col items-center">
                            <Shield className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">{t('home.about_items.security')}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">{t('home.about_items.b2b')}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Users className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">{t('home.about_items.network')}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Zap className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">{t('home.about_items.integration')}</span>
                        </div>
                    </div>
                </div>
            </section>

            <BlogSection />

            {/* Final CTA */}
            <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        {t('home.cta_final_title')}
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        {t('home.cta_final_subtitle')}
                    </p>
                    <button
                        onClick={() => router.push('/register')}
                        className="px-10 py-5 rounded-xl bg-white text-blue-600 font-bold hover:bg-gray-100 transition-all hover:scale-105 inline-flex items-center gap-2 shadow-2xl text-lg"
                    >
                        {t('home.cta_final_btn')}
                        <ArrowRight className="h-6 w-6" />
                    </button>
                    <p className="text-blue-100 text-sm mt-6">
                        {t('home.cta_final_hint')}
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">B2BChat</span>
                        </div>
                        <p className="text-sm">© 2025 B2BChat. {t('home.footer_rights')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
