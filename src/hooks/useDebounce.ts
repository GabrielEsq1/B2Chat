import { useEffect, useRef, useMemo } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
) {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedCallback = useMemo(() => {
        const func = (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        };

        func.cancel = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };

        return func;
    }, [delay]);

    return debouncedCallback;
}
