import { categories } from "@/app/data/blogData";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
    return (
        <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-center gap-2 overflow-x-auto py-4 scrollbar-hide">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "ghost"}
                            onClick={() => onCategoryChange(category)}
                            className={
                                selectedCategory === category
                                    ? "bg-gradient-primary text-white hover:opacity-90 whitespace-nowrap"
                                    : "whitespace-nowrap hover:bg-accent/10"
                            }
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};
