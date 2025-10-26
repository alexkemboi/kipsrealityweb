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
    getRoleBadgeColor: (role: string) => string;
    formatRoleName: (role: string) => string;
    handleLogout: () => void;
}

export const UserDropdown = ({
    user,
    scrollProgress,
    getDashboardPath,
    getUserInitials,
    getRoleBadgeColor,
    formatRoleName,
    handleLogout
}: UserDropdownProps) => {
    const router = useRouter();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={`flex items-center space-x-3 transition-all duration-200 ${scrollProgress > 0.1
                            ? "text-neutral-700 hover:text-blue-600 hover:bg-blue-50"
                            : "text-white hover:bg-white/20 hover:text-white"
                        }`}
                >
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-blue-500 text-white text-sm">
                            {getUserInitials()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white" align="end">
                <DropdownMenuLabel className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="bg-blue-500 text-white">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold">
                                {user.firstName} {user.lastName}
                            </span>
                            <span className="text-sm text-gray-500">{user.email}</span>
                            <Badge
                                variant="outline"
                                className={`mt-1 text-xs ${getRoleBadgeColor(user.role)}`}
                            >
                                {formatRoleName(user.role)}
                            </Badge>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(getDashboardPath())}>
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                </DropdownMenuItem>
                {user.organization && (
                    <DropdownMenuItem>
                        <Building className="h-4 w-4 mr-2" />
                        {user.organization.name}
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};