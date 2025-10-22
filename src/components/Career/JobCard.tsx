import { Jobs } from "../../app/data/jobData";
import { Clock, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';


interface JobCardProps {
  post: Jobs;
}

export const JobCard = ({ post }: JobCardProps) => {
    return (
        <Link href={`/blog/${post.id}`}>
            <article className="group relative bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-xl border border-gray-100">
                <div className="relative overflow-hidden aspect-[4/3]">
                    <Image
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        fill={true}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 shadow-sm">
                            {post.title}
                        </span>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute top-4 right-4 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                            <ArrowUpRight className="w-4 h-4 text-gray-700" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {post.description}
                    </h2>

                   
                </div>
            </article>
        </Link>
    );
};
