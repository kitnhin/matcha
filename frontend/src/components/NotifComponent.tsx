import { useRef, useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

interface NotifComponentProps {
    message: string;
    setShowNotif: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotifComponent: React.FC<NotifComponentProps> = ({ message, setShowNotif }) => {

    const intervalRef = useRef<number | null>(null);
    const [width, setWidth] = useState<number>(100);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setWidth((prev) => {
                if (prev <= 0) {
                    clearInterval(intervalRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 42);
    }, []);
    
    useEffect(() => {
        if (width <= 0) {
            setShowNotif(false);
        }
    }, [width]);

    return (
        <div className="fixed bottom-4 bg-gray-200 text-black p-3">
            <div className="flex">
            {message}
            <button className="ml-2 text-black" onClick={() => setShowNotif(false)}>X</button>
            </div>
            <div className="bg-black border" style={{width: `${width}%`}} />
        </div>
    )
}

export default NotifComponent

