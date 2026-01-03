"use client";

interface StoryCircleProps {
    name: string;
    logo: string;
    hasUnseen?: boolean;
    onClick: () => void;
    isAddButton?: boolean;
}

export default function StoryCircle({ name, logo, hasUnseen, onClick, isAddButton }: StoryCircleProps) {
    return (
        <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={onClick}>
            <div className={`p-[3px] rounded-full ${isAddButton
                    ? 'border-2 border-dashed border-gray-300'
                    : hasUnseen
                        ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600'
                        : 'bg-gray-200'
                }`}>
                <div className="bg-white p-[2px] rounded-full">
                    <img
                        src={logo || '/placeholder-user.jpg'}
                        alt={name}
                        className={`w-14 h-14 rounded-full object-cover transition-transform group-hover:scale-105 ${isAddButton ? 'opacity-50' : ''}`}
                    />
                    {isAddButton && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl text-blue-600 font-bold">+</span>
                        </div>
                    )}
                </div>
            </div>
            <span className="text-xs text-gray-600 font-medium truncate max-w-[70px]">
                {name}
            </span>
        </div>
    );
}
