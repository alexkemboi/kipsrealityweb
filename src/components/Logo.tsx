import Image from 'next/image';
import logo from '@/assets/rf_logo.jpeg';
import Link from 'next/link';

type LogoProps = {
    className?: string;
};

export const Logo = ({ className }: LogoProps) => {
    const sizeClass = className ?? 'w-20 h-20';
    return (
        <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-3">
                <a href="/">
                    <div className={`${sizeClass} relative`}>
                        <Image
                            src={logo}
                            alt="RentFlow360 Logo"
                            fill
                            className="object-contain brightness-110 mix-blend-multiply"
                            priority
                        />
                    </div>
                </a>
            </div>
        </div>
    );
};