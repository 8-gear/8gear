"use client";
import { categoryUrl } from "@/lib/categoryLinks";

import { fetchCategories } from "@/lib/categoryRequests";
import { getOptimizedCloudinaryImage } from "@/lib/cloudinaryImage";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight, Package } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  image: string;
  value: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="py-24 bg-slate-50">
       <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-slate-200 animate-pulse rounded-[2.5rem]" />)}
       </div>
    </div>
  );

  if (categories.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-2 w-8 rounded-full bg-orange-600" />
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Operational Categories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
              Shop by <span className="text-slate-300">Class</span>
            </h2>
          </div>
          <p className="text-slate-500 font-medium max-w-sm text-sm leading-relaxed">
            Specialized protective gear categorized by tactical application and ride style.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category._id}
              href={categoryUrl(category._id, true)}
              className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                <img
                  src={getOptimizedCloudinaryImage(category.image || 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=800', 1080)}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              <div className="absolute bottom-0 left-0 w-full p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={14} className="text-orange-500" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Deploy Now</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{category.name}</h3>
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
