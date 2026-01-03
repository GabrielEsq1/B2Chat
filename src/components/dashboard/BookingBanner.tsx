import { ArrowRight } from "lucide-react";

export default function BookingBanner() {
    return (
        <a
            href="https://meet.brevo.com/gabriel-esquivia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all group max-w-sm"
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 bg-green-50 rounded-full relative">
                    <span className="h-3 w-3 bg-[#00C853] rounded-full animate-pulse"></span>
                </div>
                <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                        CUPOS LIMITADOS
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">
                        Agenda tu Onboarding GRATIS
                    </div>
                </div>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#00C853] group-hover:text-white transition-colors">
                <ArrowRight className="h-4 w-4" />
            </div>
        </a>
    );
}
