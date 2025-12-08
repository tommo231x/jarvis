import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    to?: string;
    label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, label = 'Back' }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {label}
        </button>
    );
};
