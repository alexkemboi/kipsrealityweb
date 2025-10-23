import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BlogHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export const BlogHeader = ({ searchQuery, onSearchChange }: BlogHeaderProps) => {
    return (
        <header className="bg-neutral-900 text-white pt-28 pb-20">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Latest <span className="text-gradient-primary">Articles</span>
                    </h1>
                    <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                        Expert insights, guides, and tips to help you succeed in property management
                    </p>

                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                        <Input
                            type="search"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};
