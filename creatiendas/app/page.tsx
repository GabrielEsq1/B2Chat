import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhatIs from '@/components/WhatIs';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import FinalCTA from '@/components/FinalCTA';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
                <Hero />
                <WhatIs />
                <Benefits />
                <HowItWorks />
                <Features />
                <Testimonials />
                <FinalCTA />
            </main>
            <footer className="bg-gray-100 p-6 text-center text-gray-500">
                © {new Date().getFullYear()} Creatiendas. Todos los derechos reservados.
            </footer>
        </div>
    );
}
