import { blogPosts } from "@/data/blogPosts";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return {};

    return {
        title: post.seo.metaTitle,
        description: post.seo.metaDescription,
        keywords: post.seo.keywords.join(", "),
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-white">
            {/* Header / Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a Inicio
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-32 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 text-sm font-bold text-blue-600 uppercase tracking-widest mb-6">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {post.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readTime}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 border-y border-gray-100 py-6">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-gray-100">
                            <Image src={post.author.avatar} alt={post.author.name} width={48} height={48} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">{post.author.name}</div>
                            <div className="text-sm text-gray-500 font-medium">{post.author.role}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            <div className="max-w-5xl mx-auto px-4 mb-16">
                <div className="relative h-[300px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 pb-24">
                <div className="prose prose-lg lg:prose-xl prose-blue max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {/* Final CTA Block */}
                <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        ¿Listo para acelerar tus ventas B2B?
                    </h3>
                    <p className="text-blue-100 text-lg mb-8 max-w-xl">
                        Únete a las empresas que ya están cerrando negocios en tiempo real con B2BChat.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-all hover:scale-105"
                    >
                        Empezar gratis ahora
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    )
}
