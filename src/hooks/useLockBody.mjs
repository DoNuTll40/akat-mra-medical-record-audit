import { useEffect } from "react";

export default function useLockBody(lock) {
    useEffect(() => {
        if (lock) document.body.classList.add("overflow-hidden");
        else document.body.classList.remove("overflow-hidden");
        
        return () => document.body.classList.remove("overflow-hidden");
    }, [lock]);
}