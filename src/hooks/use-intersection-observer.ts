
import {useEffect,useState, useRef} from 'react'

export type IntersectionObserverOptions = IntersectionObserverInit & {
    freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
    //detect if user hits bottom of list
    const [isIntersecting, setIsIntersecting] = useState(false);

    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        },options);

        if(targetRef.current){
            observer.observe(targetRef.current);
        }

        return () => {
            observer.disconnect();
        }
        
    },[options])

    return {targetRef,isIntersecting} as const;
}