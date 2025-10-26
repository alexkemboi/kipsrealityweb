import Image from 'next/image';
import logo from '@/assets/Logo.png';
import Link from 'next/link';

export const Logo = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
                <a href="/">
                    <div className="w-30 h-30 relative">
                        <Image
                            src={logo}
                            alt="RentFlow360 Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </a>
            </div>
        </div>
    );
};