import { ArrowRight } from "lucide-react";

export default function BookingBanner() {
    return (
        <a
            href="https://meet.brevo.com/gabriel-esquivia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-6 p-1.5 pl-5 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all group"
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 bg-green-50 rounded-full relative shrink-0">
                    <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
                    <span className="relative h-2.5 w-2.5 bg-[#00C853] rounded-full"></span>
                </div>
                <div className="flex flex-col">
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] leading-none mb-1">
                        CUPOS LIMITADOS
                    </div>
                    <div className="text-sm font-bold text-[#0F172A] leading-none whitespace-nowrap">
                        Agenda tu Onboarding GRATIS
                    </div>
                </div>
            </div>
            <div className="h-9 w-9 bg-[#00C853] text-white rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0 shadow-lg shadow-green-200">
                <ArrowRight className="h-5 w-5 stroke-[3]" />
            </div>
        </a>
    );
}
