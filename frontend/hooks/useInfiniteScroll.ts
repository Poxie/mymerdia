import { RefObject, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/auth/AuthProvider";

export type InfiniteScrollDirection = 'down' | 'up';
export type RequestFinished<T> = (result: T, reachedEnd: boolean) => void;
type InfiniteScroll = <T>(
    query: string, 
    onRequestFinished: RequestFinished<T>,
    options: {
        threshold: number;
        fetchAmount: number;
        fetchOnMount?: boolean;
        isAtEnd?: boolean;
        direction?: InfiniteScrollDirection;
        scrollContainer?: RefObject<HTMLDivElement>;
        identifier?: number | string;
        standBy?: boolean;
    }
) => {
    loading: boolean;
    reachedEnd: boolean;
}

const endCache: {[identifier: string]: boolean} = {};
export const useInfiniteScroll: InfiniteScroll = (query, onRequestFinished, options) => {
    const { get, token, loading: tokenLoading } = useAuth();
    const [loading, setLoading] = useState(options.fetchOnMount ? true : false);
    const [reachedEnd, setReachedEnd] = useState(options.identifier ? endCache[options.identifier] : false);
    const fetching = useRef(false);

    useEffect(() => {
        if(options.identifier && endCache[options.identifier]) {
            return setReachedEnd(true);
        }
        setReachedEnd(false);
    }, [options.identifier]);

    // Fetching on mount
    useEffect(() => {
        if(!options.fetchOnMount || tokenLoading || options.isAtEnd || options.standBy || fetching.current || endCache[options.identifier || '']) return setLoading(false);

        fetching.current = true;
        setLoading(true);
        get(query)
            .then((result: any) => {
                const reachedEnd = result.length < options.fetchAmount;
                onRequestFinished(result, reachedEnd);
                setLoading(false);
                setReachedEnd(reachedEnd);
                fetching.current = false;

                // Adding reached end to cache
                if(reachedEnd && options.identifier) {
                    endCache[options.identifier] = true
                }
            })
    }, [tokenLoading, options.identifier, options.standBy]);

    // Handling event listeners
    useEffect(() => {
        if(!token || reachedEnd) return;

        // Selecting correct scroll container
        const scrollContainer = options.scrollContainer?.current || window;

        const onScroll = async () => {
            if(fetching.current || options.isAtEnd) return;
            
            let diffFromBottom: number;
            let diffFromTop: number;
            if(options.scrollContainer?.current) {
                const el = options.scrollContainer.current;
                diffFromBottom = (
                    el.scrollHeight -
                    el.scrollTop -
                    el.offsetHeight
                )
                diffFromTop = el.scrollTop;
            } else {
                diffFromBottom = Math.abs(window.scrollY + window.innerHeight - document.body.offsetHeight);
                diffFromTop = window.scrollY;
            }
            
            const fetchDirectionDown = (
                options.direction !== 'up' && 
                diffFromBottom < options.threshold &&
                diffFromBottom > 0
            );
            const fetchDirectionUp = (
                options.direction === 'up' && 
                diffFromTop < options.threshold && 
                diffFromTop > 0
            )
            if(fetchDirectionDown || fetchDirectionUp) {
                fetching.current = true;
                setLoading(true);
                const result: any = await get(query);
                const reachedEnd = result.length < options.fetchAmount;
                
                fetching.current = false;
                setLoading(false);
                onRequestFinished(result, reachedEnd);
                setReachedEnd(reachedEnd);
    
                if(reachedEnd) {
                    scrollContainer.removeEventListener('scroll', onScroll);
                    
                    // Caching query reached end
                    if(options.identifier) {
                        endCache[options.identifier] = true;
                    }
                }
            }
        }

        scrollContainer.addEventListener('scroll', onScroll);
        return () => scrollContainer.removeEventListener('scroll', onScroll);
    }, [get, token, tokenLoading, query, reachedEnd]);

    return {
        loading,
        reachedEnd
    }
}