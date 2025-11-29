import Link from 'next/link';
import '@/app/styles/landing.css';

export default function LandingPage() {
    return (
        <div className="landing-page">
            {/* NAVBAR */}
            <nav className="navbar">
                <div className="container nav-content">
                    <Link href="/" className="logo">
                        <i className="fa-solid fa-store"></i> StoreBuilder
                    </Link>
                    <Link href="/" className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                        Ir al Constructor
                    </Link>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="hero">
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-text">
                            <span className="hero-badge">🔥 Oferta de Lanzamiento</span>
                            <h1>Crea tu Tienda Online en Minutos <span className="text-primary">Sin Programar</span></h1>
                            <p>La herramienta más fácil y rápida para crear tu tienda online. Diseño profesional, integración con WhatsApp y resultados inmediatos.</p>
                            <a href="#pricing" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>Ver Oferta Especial</a>
                        </div>
                        <div className="hero-img-container">
                            <img src="/img/dashboard-preview.png" alt="Dashboard Preview" className="hero-img" />
                            <div className="floating-card fc-1">
                                <i className="fa-solid fa-rocket" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                                <div>
                                    <strong>Súper Rápido</strong>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>En 5 minutos</div>
                                </div>
                            </div>
                            <div className="floating-card fc-2">
                                <i className="fa-brands fa-whatsapp" style={{ fontSize: '2rem', color: '#25D366' }}></i>
                                <div>
                                    <strong>WhatsApp</strong>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Integrado</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="features">
                <div className="container">
                    <div className="section-title">
                        <h2>Todo lo que Necesitas para Vender Online</h2>
                        <p>Herramientas profesionales al alcance de todos</p>
                    </div>

                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="f-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                            <h3>Sin Código</h3>
                            <p>Crea tu tienda sin saber programar. Todo visual, todo fácil. Arrastra, suelta y listo.</p>
                        </div>

                        <div className="feature-card">
                            <div className="f-icon"><i className="fa-brands fa-whatsapp"></i></div>
                            <h3>WhatsApp Integrado</h3>
                            <p>Tus clientes te contactan directo por WhatsApp. Ventas más rápidas y personales.</p>
                        </div>

                        <div className="feature-card">
                            <div className="f-icon"><i className="fa-solid fa-mobile-screen"></i></div>
                            <h3>100% Responsive</h3>
                            <p>Tu tienda se ve perfecta en celular, tablet y computadora. Sin configuración extra.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="pricing">
                <div className="container">
                    <div className="section-title" style={{ color: 'white' }}>
                        <h2 style={{ color: 'white' }}>¡Oferta de Lanzamiento!</h2>
                        <p style={{ color: '#94a3b8' }}>Precio especial por tiempo limitado. No te lo pierdas.</p>
                    </div>

                    <div className="pricing-card">
                        <div className="promo-banner">AHORRA 50%</div>
                        <h3>Membresía Vitalicia</h3>
                        <div className="price-tag">$60.000 <span style={{ fontSize: '1.5rem', color: 'var(--text-light)', fontWeight: 500 }}>COP</span></div>
                        <p className="price-sub">Pago único. Sin mensualidades. Tuya para siempre.</p>

                        <ul className="price-features">
                            <li><i className="fa-solid fa-check-circle"></i> Acceso ilimitado al Creador Web</li>
                            <li><i className="fa-solid fa-check-circle"></i> Productos Ilimitados</li>
                            <li><i className="fa-solid fa-check-circle"></i> Integración con WhatsApp</li>
                        </ul>

                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }}>Comprar Ahora</button>
                    </div>
                </div>
            </section>

            <footer>
                <div className="container">
                    <p>&copy; 2025 Store Builder. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
