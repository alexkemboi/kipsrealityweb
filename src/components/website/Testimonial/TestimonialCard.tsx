import { Testimonial } from "@/app/data/TestimonialData"
import Image from "next/image";
import { Quote } from "lucide-react";

interface TestimonialsCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard = ({ testimonial }: TestimonialsCardProps) => {
  const name = testimonial?.name ?? "Anonymous";
  const role = testimonial?.role ?? "";
  const text = testimonial?.text ?? "";

  return (
    <div className="relative bg-slate-50 border-2 border-[#003b73]/20 p-10 pt-16 rounded-[24px] h-full shadow-md hover:shadow-xl transition-all duration-300 group">
      {/* Quotation Mark Icon */}
      <div className="absolute top-8 left-10 text-[#003b73]/60 group-hover:text-[#003b73] transition-colors">
        <Quote size={24} strokeWidth={2} />
      </div>

      <div className="flex flex-col h-full justify-between">
        <blockquote className="mb-8">
          <p className="text-slate-700 leading-[1.6] text-base md:text-[18px]">
            "{text}"
          </p>
        </blockquote>

        <div className="flex items-center gap-5 border-t-2 border-[#003b73]/10 pt-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-[#003b73]/20 p-0.5 bg-white shadow-md">
            <Image
              src={testimonial.image || "/man.jpeg"}
              alt={name}
              fill
              sizes="(max-width: 80px) 100vw, 80px"
              className="object-cover rounded-full"
              priority
            />
          </div>
          <div>
            <div className="font-black text-neutral-900 text-base md:text-lg uppercase tracking-widest font-heading leading-tight">{name}</div>
            <div className="text-[11px] md:text-[12px] text-[#002b5b] font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#003b73]"></span>
              {role || "Customer"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

