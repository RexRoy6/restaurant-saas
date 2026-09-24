import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DashboardCard({
  title,
  value,
  href,
}: {
  title: string;
  value: number | string;
  href?: string;
}) {
  const content = (
    <div
      className="
        flex flex-col justify-between h-full p-6 
        bg-white rounded-2xl border border-gray-200 
        transition-all duration-300 ease-out 
        hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] group
      "
    >
      <div className="flex justify-between items-start gap-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
          {title}
        </span>
        
        {/* Micro-interacción: Flecha sutil que aparece al hacer hover */}
        {href && (
          <ArrowRight 
            size={16} 
            className="text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-black transition-all duration-300 shrink-0 mt-0.5" 
          />
        )}
      </div>

      <span className="text-3xl font-extrabold text-gray-900 tracking-tighter mt-4">
        {value}
      </span>
    </div>
  );

  // Si pasamos una ruta, envolvemos la tarjeta en un enlace de Next.js
  if (href) {
    return (
      <Link href={href} className="block h-full focus:outline-none">
        {content}
      </Link>
    );
  }

  // Si no hay ruta, simplemente mostramos el contenedor
  return <div className="h-full">{content}</div>;
}