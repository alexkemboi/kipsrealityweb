import Image from 'next/image';
import logo from '@/assets/Logo.png';

export const Logo = () => {
    return (
        <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
                {/* Logo Image */}
                <div className="w-12 h-12 relative">
                    <Image
                        src={logo}
                        alt="RentFlow360 Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Text */}
                <span className="text-3xl font-bold text-neutral-900 bg-clip-text">
                    RentFlow360
                </span>
            </div>
        </div>
    );
};