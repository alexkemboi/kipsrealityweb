"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";

interface ReusableCardProps {
  image: string;
  title: string;
  description?: string;
  category?: string;
  link?: string;
  metaLeft?: string; // e.g. Author or Price
  metaRight?: string; // e.g. Time, Location.
  badgeColor?: string; // tailwind class for badge "
  showArrow?: boolean;
}

export const ListingCard = ({
  image,
  title,
  description,
  category,
  link = "#",
  metaLeft,
  metaRight,
  badgeColor = "bg-white/95",
  showArrow = true,
}: ReusableCardProps) => {
  return (
    <Link href={link}>
      <article className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

        {/* Image Section */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category Badge */}
          {category && (
            <div className="absolute top-4 left-4">
              <span
                className={`${badgeColor} backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 shadow-sm`}
              >
                {category}
              </span>
            </div>
          )}

          {/* Hover Arrow */}
          {showArrow && (
            <div className="absolute top-4 right-4 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <ArrowUpRight className="w-4 h-4 text-gray-700" />
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {title}
          </h2>

          {description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 font-normal">
              {description}
            </p>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {metaLeft && (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                {metaLeft}
              </div>
            )}

            {metaRight && (
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Clock className="w-3 h-3" />
                <span>{metaRight}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};
