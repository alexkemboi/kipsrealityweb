import { Button } from "../ui/button";
import {
    Drawer, DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../ui/drawer";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/rf_logo.jpeg";
import Link from "next/link";

interface MobileMenuProps {
    scrollProgress: number;
    navLinks: readonly { name: string; href: string; }[];
}

export const MobileMenu = ({
    scrollProgress,
    navLinks
}: MobileMenuProps) => {
    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`md:hidden transition-all duration-200 ${scrollProgress > 0.1
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-slate-700 hover:bg-slate-100"
                        }`}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full top-0 right-0 left-auto mt-0 w-80 rounded-none bg-white border-l border-slate-200">
                <DrawerHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <Image
                            src={Logo}
                            alt="RentFlow360"
                            width={32}
                            height={32}
                            className="object-contain mix-blend-multiply"
                        />
                        <div>
                            <DrawerTitle className="font-bold text-lg text-slate-900">
                                RentFlow360
                            </DrawerTitle>
                        </div>
                    </div>
                    <DrawerClose asChild>
                        <button className="p-2 rounded-lg hover:bg-slate-100">
                            <X className="w-5 h-5 text-slate-600" />
                        </button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-1">
                        {navLinks.map((link) => (
                            <DrawerClose asChild key={link.name}>
                                <Link
                                    href={link.href}
                                    className="block p-4 rounded-xl hover:bg-[#f0f7ff] transition-all duration-200 active:scale-[0.98] text-slate-700 hover:text-[#003b73] font-medium"
                                >
                                    {link.name}
                                </Link>
                            </DrawerClose>
                        ))}
                    </div>
                </div>

                <DrawerFooter className="border-t border-slate-200 p-6">
                    <div className="flex flex-col gap-3">
                        <DrawerClose asChild>
                            <Link href="/login" className="w-full">
                                <Button 
                                    variant="outline" 
                                    className="w-full h-11 rounded-full border-[#003b73] text-[#003b73] hover:bg-[#f0f7ff] font-semibold"
                                >
                                    Login
                                </Button>
                            </Link>
                        </DrawerClose>
                        <DrawerClose asChild>
                            <Link href="/signup" className="w-full">
                                <Button className="w-full h-11 rounded-full bg-[#003b73] text-white hover:bg-[#002b5b] font-bold shadow-sm">
                                    Sign up
                                </Button>
                            </Link>
                        </DrawerClose>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};