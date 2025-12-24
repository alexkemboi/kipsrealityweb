import { User, LogOut, Building, ChevronDown, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface UserDropdownProps {
    user: any;
    scrollProgress: number;
    textColor: string;
    hoverColor: string;
    getDashboardPath: () => string;
    getUserInitials: () => string;
    formatRoleName: (role: string) => string;
    handleLogout: () => void;
}

export const UserDropdown = ({
    user,
    scrollProgress,
    getDashboardPath,
    getUserInitials,
    formatRoleName,
    handleLogout
}: UserDropdownProps) => {
    const router = useRouter();

    return (
        <>
        </>
    );
};