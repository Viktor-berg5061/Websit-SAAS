
import React, { useState, useEffect } from 'react';

// --- DATA STRUCTURE ---
const portfolioItems = [
  { id: 1, title: "Lume Architecture", category: "Design & Arkitektur", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200", stats: { speed: "0.6s", seo: "100", conversion: "+45%" }, tags: ["Framer", "Architecture", "Luxury"] },
  { id: 2, title: "Savor Catering", category: "Mat & Restaurang", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200", stats: { speed: "0.8s", seo: "98", conversion: "+62%" }, tags: ["Wix Studio", "E-com", "Booking"] },
  { id: 3, title: "Nova Tech SaaS", category: "Teknik & Mjukvara", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200", stats: { speed: "0.4s", seo: "100", conversion: "+38%" }, tags: ["Webflow", "SaaS", "Lottie"] },
  { id: 4, title: "Vantage Legal", category: "Juridik & Finans", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200", stats: { speed: "0.7s", seo: "99", conversion: "+22%" }, tags: ["Professional", "Trust", "Security"] },
  { id: 5, title: "Studio Pulse", category: "Kreativ Byrå", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200", stats: { speed: "0.5s", seo: "96", conversion: "+54%" }, tags: ["Bold", "Experimental", "GSAP"] },
  { id: 6, title: "EcoGarden Shop", category: "E-handel", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1200", stats: { speed: "0.9s", seo: "100", conversion: "+41%" }, tags: ["Shopify", "Eco", "Clean"] },
  { id: 7, title: "Quantum AI", category: "Framtidsteknik", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200", stats: { speed: "0.3s", seo: "100", conversion: "+29%" }, tags: ["AI", "Future", "Webflow"] },
  { id: 8, title: "Nordic Home", category: "Fastigheter", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200", stats: { speed: "0.6s", seo: "98", conversion: "+33%" }, tags: ["Clean", "Real Estate", "Luxury"] },
  { id: 9, title: "Vantage Fitness", category: "Hälsa & Sport", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200", stats: { speed: "0.5s", seo: "97", conversion: "+71%" }, tags: ["Dynamic", "Gym", "Performance"] }
];

// --- SIMULATION COMPONENTS ---

const LumeSim = () => (
  <div className="bg-white font-serif selection:bg-black selection:text-white pb-40">
    <nav className="p-12 flex justify-between items-center border-b border-slate-100">
      <div className="text-2xl font-black uppercase tracking-tighter">LUME</div>
      <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
        <span>Projects</span><span>Studio</span><span>Contact</span>
      </div>
    </nav>
    <section className="px-12 py-32 space-y-20">
      <h1 className="text-[12rem] leading-[0.7] font-bold tracking-tighter animate-in slide-in-from-bottom-24 duration-1000">Defined<br/>Space.</h1>
      <div className="grid grid-cols-12 gap-12 items-end">
        <div className="col-span-8 overflow-hidden group rounded-sm shadow-2xl">
          <img src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1200" className="w-full grayscale group-hover:grayscale-0 transition-all duration-[2s]" />
        </div>
        <div className="col-span-4 pb-20 space-y-8">
          <p className="text-xl font-light italic text-slate-400 leading-relaxed">Architecture is the learned game, correct and magnificent, of forms assembled in the light.</p>
          <div className="h-px bg-slate-900 w-24"></div>
        </div>
      </div>
    </section>
    <section className="bg-slate-50 py-40 px-12 grid grid-cols-2 gap-32">
      <div className="space-y-12">
        <h2 className="text-8xl leading-none">The Soul of the<br/>Structure.</h2>
        <p className="text-xl text-slate-500 font-light leading-relaxed">Our process begins with the context. We don't just build buildings; we create environments that speak to their surroundings.</p>
        <div className="grid grid-cols-2 gap-8 pt-12">
           <div className="space-y-4">
              <h4 className="text-3xl">Residential</h4>
              <p className="text-sm opacity-50">Private sanctuaries designed for living.</p>
           </div>
           <div className="space-y-4">
              <h4 className="text-3xl">Cultural</h4>
              <p className="text-sm opacity-50">Public spaces that inspire community.</p>
           </div>
        </div>
      </div>
      <div className="aspect-[4/5] bg-slate-200 overflow-hidden shadow-2xl">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800" className="w-full h-full object-cover" />
      </div>
    </section>

    {/* Section 4: Philosophy & Materials */}
    <section className="py-40 px-12 border-t border-slate-100 grid grid-cols-12 gap-24 items-center">
       <div className="col-span-7 space-y-16">
          <h2 className="text-8xl tracking-tighter">Honest Materiality.</h2>
          <div className="grid grid-cols-2 gap-12">
             <div className="space-y-6">
                <div className="aspect-video bg-slate-100 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1518005020250-675f04029d30?q=80&w=600" className="w-full h-full object-cover grayscale" />
                </div>
                <h4 className="text-2xl font-bold">Cast Concrete</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Raw textures that age gracefully, reflecting the passage of time on the facade.</p>
             </div>
             <div className="space-y-6">
                <div className="aspect-video bg-slate-100 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=600" className="w-full h-full object-cover grayscale" />
                </div>
                <h4 className="text-2xl font-bold">Nordic Timber</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Sustainably sourced wood providing warmth and a biological connection.</p>
             </div>
          </div>
       </div>
       <div className="col-span-5 space-y-8">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 italic">The Lume Manifesto</span>
          <p className="text-3xl leading-snug">"We believe architecture should be silent. It shouldn't scream for attention, but rather provide the perfect frame for the life that happens within it."</p>
          <div className="h-px bg-slate-200 w-full"></div>
          <p className="text-slate-400">Founded in 2012, Lume has consistently pushed the boundaries of minimalist Scandinavian design, merging technical precision with emotional depth.</p>
       </div>
    </section>

    {/* Section 5: The Partners */}
    <section className="py-40 px-12 bg-black text-white">
       <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
             <h2 className="text-7xl tracking-tighter">The Visionaries.</h2>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Led by a commitment to excellence</p>
          </div>
          <div className="grid grid-cols-3 gap-12">
             {['Elias Thorne', 'Sofia Vane', 'Markus Berg'].map(name => (
                <div key={name} className="space-y-8 group">
                   <div className="aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                      <img src={`https://images.unsplash.com/photo-${name === 'Elias Thorne' ? '1472099645785-5658abf4ff4e' : name === 'Sofia Vane' ? '1573496359142-b8d87734a5a2' : '1500648767791-00dcc994a43e'}?q=80&w=600`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   </div>
                   <div className="space-y-2 border-l-2 border-white/10 pl-8 group-hover:border-white transition-colors">
                      <h4 className="text-3xl">{name}</h4>
                      <p className="text-[10px] uppercase tracking-widest opacity-30">Lead Architect — Partner</p>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 6: Selected Works Extension */}
    <section className="py-40 px-12 text-center space-y-24">
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Selected Works 2025</span>
      <div className="grid grid-cols-3 gap-12">
        {[
          { name: "The Glass House", img: "https://images.unsplash.com/photo-1503387762-592dee58c460?q=80&w=600" },
          { name: "Monolith Office", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600" },
          { name: "Urban Sanctuary", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600" }
        ].map((proj, i) => (
          <div key={i} className="space-y-8 text-left group cursor-pointer">
            <div className="aspect-[3/4] bg-slate-100 overflow-hidden rounded-sm transition-all duration-700 group-hover:shadow-2xl">
               <img src={proj.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
            </div>
            <div>
              <h4 className="text-3xl font-bold tracking-tighter">{proj.name}</h4>
              <p className="text-xs uppercase tracking-widest opacity-40 italic mt-1">Stockholm — Sweden</p>
            </div>
          </div>
        ))}
      </div>
    </section>
    <footer className="p-12 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em]">
      <p>© 2025 Lume Architecture</p>
      <div className="flex gap-8"><span>Instagram</span><span>LinkedIn</span></div>
    </footer>
  </div>
);

const SavorSim = () => (
  <div className="bg-[#fffdfa] font-sans selection:bg-amber-600 selection:text-white pb-40">
    <nav className="p-10 flex justify-between items-center fixed w-full top-0 z-50 bg-[#fffdfa]/80 backdrop-blur-xl">
      <div className="text-3xl font-serif font-black text-amber-900 italic">SAVOR.</div>
      <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-amber-900/40">
        <span>Meny</span><span>Event</span><span>Boka</span>
      </div>
    </nav>
    <section className="relative h-screen flex items-center justify-center text-center px-12 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600" className="absolute inset-0 w-full h-full object-cover brightness-[0.6] scale-110" />
      <div className="relative z-10 space-y-12">
        <h1 className="text-8xl md:text-[12rem] font-serif text-white leading-[0.8] tracking-tight">Elegance<br/><span className="italic font-normal opacity-70">on a plate.</span></h1>
        <p className="text-2xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">Stockholm's premier bespoke catering for high-end events and corporate experiences.</p>
        <button className="bg-amber-600 text-white px-12 py-6 rounded-full font-bold uppercase text-[11px] tracking-widest hover:scale-105 transition-transform shadow-2xl">Start Planning</button>
      </div>
    </section>
    <section className="py-40 px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-32 items-center">
      <div className="space-y-12">
        <h2 className="text-6xl font-serif font-bold text-amber-950">A commitment to local harvest.</h2>
        <p className="text-lg text-slate-500 leading-relaxed">We source every ingredient from artisan producers around the Mälaren valley. Our menu changes with the moon, the sun, and the soil.</p>
        <div className="space-y-8">
          {[
            { name: "Nordic Sea Tasting", desc: "Hand-dived scallops, dills, gurka" },
            { name: "Field & Forest", desc: "Hängmörat vilt, kantareller, enbär" },
            { name: "Orchard Finale", desc: "Guldäpplen, honung, syrad grädde" }
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-end border-b border-amber-200 pb-4 group cursor-pointer hover:border-amber-600 transition-colors">
              <div>
                <h4 className="text-xl font-bold text-amber-900 group-hover:text-amber-600">{item.name}</h4>
                <p className="text-xs text-slate-400 italic">{item.desc}</p>
              </div>
              <span className="font-bold text-amber-700">1495:- / p</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="absolute -inset-10 bg-amber-100 rounded-full blur-[100px] opacity-50"></div>
        <img src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800" className="w-full rounded-[4rem] relative z-10 shadow-2xl" />
      </div>
    </section>

    {/* Section 4: Bespoke Occasions */}
    <section className="py-40 px-12 bg-amber-50">
       <div className="max-w-7xl mx-auto text-center space-y-24">
          <h2 className="text-7xl font-serif font-black text-amber-950">Events Beyond<br/>Expectation.</h2>
          <div className="grid grid-cols-3 gap-12">
             {[
               { title: "Weddings", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600" },
               { title: "Corporate Galas", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600" },
               { title: "Private Salons", img: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=600" }
             ].map((occ, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="aspect-[3/4] overflow-hidden rounded-full mb-8 shadow-xl">
                      <img src={occ.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                   </div>
                   <h4 className="text-3xl font-serif font-bold text-amber-900">{occ.title}</h4>
                   <p className="text-xs uppercase tracking-widest text-amber-700/50 mt-2 font-black">Bespoke Curation</p>
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 5: The Chef's Vision */}
    <section className="py-40 px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-32 items-center">
       <div className="order-2 md:order-1 relative">
          <img src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=800" className="w-full rounded-[4rem] shadow-2xl grayscale" />
          <div className="absolute top-10 -left-10 bg-white p-10 rounded-full shadow-2xl animate-bounce">
             <span className="text-amber-900 font-serif italic text-xl">Chef Magnus Vane</span>
          </div>
       </div>
       <div className="order-1 md:order-2 space-y-12">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600">The Kitchen Philosophy</span>
          <h2 className="text-6xl font-serif font-black text-amber-950">Respect the<br/>Ingredient.</h2>
          <p className="text-xl text-slate-500 leading-relaxed font-light italic">"Min resa började i Värmlands djupa skogar. För mig handlar lyx inte om prislappar, utan om den perfekta mognaden i ett vilt bär eller djupet i en 48-timmars buljong."</p>
          <div className="space-y-6">
             {['Zero-waste operation', 'Biodynamiska gårdspartners', 'Traditionella konserveringsmetoder'].map(point => (
                <div key={point} className="flex items-center space-x-4 border-b border-amber-100 pb-4">
                   <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                   <span className="text-sm font-bold text-amber-900 uppercase tracking-widest">{point}</span>
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 6: Testimonials */}
    <section className="py-40 px-12 border-t border-amber-100">
       <div className="max-w-4xl mx-auto text-center space-y-16">
          <div className="text-5xl font-serif italic text-amber-900">"Savor skapade inte bara maten till vår lansering; de skapade en hel värld. Den sensoriska resan var olik allt våra gäster upplevt tidigare."</div>
          <div className="space-y-2">
             <h4 className="text-xl font-bold uppercase tracking-widest text-amber-950">Elin Nordström</h4>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">CMO — Vantage Global</p>
          </div>
       </div>
    </section>

    <footer className="bg-amber-950 text-amber-100/40 py-24 px-12 text-center text-[10px] font-bold uppercase tracking-[0.4em]">
       <div className="text-3xl text-amber-500 mb-12 italic font-serif font-black">SAVOR.</div>
       <p>Digitalvägen 1 — 111 22 Stockholm — info@savor.se</p>
    </footer>
  </div>
);

const NovaSim = () => (
  <div className="bg-[#020617] text-white font-sans selection:bg-blue-600 pb-40">
    <nav className="p-8 flex justify-between items-center border-b border-white/5 bg-[#020617]/50 backdrop-blur-3xl sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <span className="font-black text-2xl tracking-tighter italic">NOVA</span>
      </div>
      <div className="hidden md:flex gap-12 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span className="hover:text-white cursor-pointer transition-colors">Infrastructure</span>
        <span className="hover:text-white cursor-pointer transition-colors">Security</span>
        <span className="hover:text-white cursor-pointer transition-colors">Pricing</span>
      </div>
      <button className="bg-blue-600 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(37,99,235,0.3)]">Get Access</button>
    </nav>
    <section className="pt-40 pb-60 px-12 text-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-blue-600/10 blur-[200px] rounded-full"></div>
      <h1 className="text-9xl md:text-[15rem] font-black tracking-tighter leading-[0.8] mb-12 animate-in slide-in-from-top-24 duration-1000">The Neural<br/><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Backbone.</span></h1>
      <p className="text-2xl text-slate-400 max-w-4xl mx-auto font-light leading-relaxed mb-20">Skala din infrastruktur utan friktion. Global latens under 15ms. 100% autonom driftsättning.</p>
      <div className="max-w-6xl mx-auto p-4 bg-white/5 border border-white/10 rounded-[3rem] shadow-3xl">
        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200" className="w-full rounded-[2rem] brightness-75" />
      </div>
    </section>

    {/* Section 3: Security Protocol */}
    <section className="py-40 px-12 relative z-10">
       <div className="max-w-7xl mx-auto grid grid-cols-12 gap-24 items-center">
          <div className="col-span-5 space-y-12">
             <div className="inline-block bg-blue-600/20 text-blue-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Security Level: Omega</div>
             <h2 className="text-7xl font-black italic uppercase leading-[0.8]">Hardened<br/>by Design.</h2>
             <p className="text-slate-400 leading-relaxed text-lg">Varje datapaket skyddas av post-kvant-kryptering. Vi arbetar med en nollförtroendearkitektur som eliminerar mänskliga fel vid källan.</p>
             <div className="grid grid-cols-2 gap-8">
                {[
                  { label: "Compliance", val: "SOC2 Type II" },
                  { label: "Encryption", val: "AES-512-GCM" },
                  { label: "Redundancy", val: "4N Architecture" },
                  { label: "Latency", val: "< 1ms Edge" }
                ].map(stat => (
                   <div key={stat.label} className="border-l border-white/10 pl-6 py-2">
                      <p className="text-xs uppercase font-black text-slate-500 tracking-widest">{stat.label}</p>
                      <p className="text-xl font-bold italic">{stat.val}</p>
                   </div>
                ))}
             </div>
          </div>
          <div className="col-span-7 bg-white/5 border border-white/10 p-4 rounded-[3rem]">
             <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000" className="w-full rounded-[2rem] opacity-60 hover:opacity-100 transition-opacity duration-1000" />
          </div>
       </div>
    </section>

    {/* Section 4: Integration Ecosystem */}
    <section className="py-40 bg-white/5 border-y border-white/5">
       <div className="max-w-7xl mx-auto px-12 text-center space-y-24">
          <div className="space-y-6">
             <h2 className="text-8xl font-black tracking-tighter uppercase">Unified Stack.</h2>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Anslut sömlöst till dina befintliga verktyg</p>
          </div>
          <div className="grid grid-cols-6 gap-8 grayscale opacity-40">
             {['AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker', 'Terraform'].map(tool => (
                <div key={tool} className="p-12 border border-white/5 flex items-center justify-center font-black text-2xl italic tracking-tighter hover:bg-white hover:text-black hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                   {tool}
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 5: API & Documentation */}
    <section className="py-60 px-12">
       <div className="max-w-7xl mx-auto grid grid-cols-12 gap-24 items-start">
          <div className="col-span-4 space-y-12 sticky top-40">
             <h2 className="text-6xl font-black italic uppercase leading-none">Developer<br/>First.</h2>
             <p className="text-slate-500 leading-relaxed">Byggt av ingenjörer, för ingenjörer. Våra REST- och GraphQL-API:er ger granulär kontroll över varje aspekt av din beräkningslivscykel.</p>
             <div className="flex flex-col gap-4">
                <button className="flex items-center justify-between bg-white text-black p-6 font-black uppercase tracking-widest text-xs">
                   <span>Explore Docs</span>
                   <span>→</span>
                </button>
                <button className="flex items-center justify-between border border-white/10 p-6 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
                   <span>SDK Reference</span>
                   <span>→</span>
                </button>
             </div>
          </div>
          <div className="col-span-8 bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] p-12 font-mono text-sm leading-relaxed overflow-hidden shadow-4xl">
             <div className="flex gap-2 mb-10">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
             </div>
             <div className="text-blue-400">const <span className="text-white">nova</span> = require(<span className="text-amber-400">'@nova-cloud/core'</span>);</div>
             <br/>
             <div className="text-slate-500">// Initialize cluster on the edge</div>
             <div className="text-blue-400">await <span className="text-white">nova</span>.clusters.deploy({'{'}</div>
             <div className="pl-6">
                <div className="text-slate-300">region: <span className="text-amber-400">'eu-north-1'</span>,</div>
                <div className="text-slate-300">nodes: <span className="text-purple-400">64</span>,</div>
                <div className="text-slate-300">modality: <span className="text-amber-400">'neural-compute'</span>,</div>
                <div className="text-slate-300">autoScale: <span className="text-purple-400">true</span></div>
             </div>
             <div className="text-blue-400">{'}'});</div>
             <br/>
             <div className="text-slate-500">// Start autonomous scaling protocol</div>
             <div className="text-blue-400"><span className="text-white">nova</span>.on(<span className="text-amber-400">'spike'</span>, (data) ={'>'} {'{'}</div>
             <div className="pl-6 text-slate-300">
                <span className="text-blue-400">return</span> nova.balance.load(data.origin);
             </div>
             <div className="text-blue-400">{'}'});</div>
          </div>
       </div>
    </section>
  </div>
);

const VantageLegalSim = () => (
  <div className="bg-slate-50 text-[#0f172a] font-serif pb-40">
    <header className="bg-white p-12 flex justify-between items-center border-b border-slate-200">
      <div className="text-3xl font-bold border-l-[12px] border-[#0f172a] pl-8 uppercase tracking-tighter italic">VANTAGE LEGAL</div>
      <div className="flex gap-12 font-sans text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
        <span>Expertise</span><span>Attorneys</span><span>Insights</span>
      </div>
    </header>
    <section className="grid grid-cols-2 gap-24 p-24 items-center min-h-[90vh]">
      <div className="space-y-12">
        <h1 className="text-8xl font-bold leading-tight tracking-tight">Integrity in<br/>every brief.</h1>
        <p className="font-sans text-xl text-slate-500 leading-relaxed max-w-lg">Providing strategic legal council for international commerce, complex litigation, and private equity transactions.</p>
        <button className="font-sans bg-[#0f172a] text-white px-16 py-6 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl">Consult Senior Partner</button>
      </div>
      <div className="relative">
        <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200" className="w-full h-full object-cover shadow-2xl border-[30px] border-white" />
      </div>
    </section>
    <section className="bg-white py-40 px-24 space-y-24">
       <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold italic">A legacy of excellence since 1984.</h2>
          <p className="font-sans text-slate-400 text-sm uppercase tracking-widest font-bold">Stockholm — London — New York</p>
       </div>
       <div className="grid grid-cols-3 gap-16">
          {[
            { law: "Corporate Law", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600" },
            { law: "M&A Strategy", img: "https://images.unsplash.com/photo-1454165833767-13300a7bc93d?q=80&w=600" },
            { law: "Dispute Resolution", img: "https://images.unsplash.com/photo-1521791136064-7986c2959213?q=80&w=600" }
          ].map(item => (
            <div key={item.law} className="group cursor-pointer">
               <div className="aspect-video bg-slate-100 mb-8 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                 <img src={item.img} className="w-full h-full object-cover" />
               </div>
               <div className="p-0 space-y-4">
                  <h4 className="text-3xl font-bold border-b border-slate-100 pb-4 group-hover:border-slate-900 transition-colors">{item.law}</h4>
                  <p className="font-sans text-slate-500 text-sm leading-relaxed">Protecting your assets with precision and foresight in a rapidly changing global market.</p>
               </div>
            </div>
          ))}
       </div>
    </section>

    {/* Section 3: Global Expertise */}
    <section className="py-40 px-24 grid grid-cols-2 gap-32 items-center">
       <div className="space-y-12">
          <span className="font-sans text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Global Network</span>
          <h2 className="text-7xl font-bold italic">Unrivaled reach across five continents.</h2>
          <p className="font-sans text-lg text-slate-500 leading-relaxed font-light">Vi upprätthåller strategiska allianser med ledande advokatbyråer globalt, vilket säkerställer att våra klienter får sömlös representation oavsett vart deras affärer tar dem.</p>
          <div className="grid grid-cols-2 gap-8 font-sans">
             <div>
                <p className="text-4xl font-bold">120+</p>
                <p className="text-xs uppercase tracking-widest font-black opacity-30 mt-2">Active jurisdictions</p>
             </div>
             <div>
                <p className="text-4xl font-bold">4.2B</p>
                <p className="text-xs uppercase tracking-widest font-black opacity-30 mt-2">Transaction volume (2024)</p>
             </div>
          </div>
       </div>
       <div className="aspect-[4/5] bg-slate-200 overflow-hidden shadow-2xl border-[20px] border-white">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800" className="w-full h-full object-cover" />
       </div>
    </section>

    {/* Section 4: Senior Leadership */}
    <section className="bg-[#0f172a] text-white py-40 px-24">
       <div className="max-w-7xl mx-auto space-y-32">
          <div className="flex justify-between items-end">
             <h2 className="text-8xl font-bold tracking-tighter">The Senior<br/>Partners.</h2>
             <span className="font-sans text-xs uppercase tracking-widest font-black opacity-30 mb-4">Integrity · Foresight · Resolve</span>
          </div>
          <div className="grid grid-cols-4 gap-12">
             {[
                { name: 'Arthur Sterling', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600' },
                { name: 'Beatrice Vance', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600' },
                { name: 'Julian Thorne', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600' },
                { name: 'Sloane Merrick', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600' }
             ].map(partner => (
                <div key={partner.name} className="space-y-8 group">
                   <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                      <img src={partner.img} className="w-full h-full object-cover" />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-3xl font-bold tracking-tight">{partner.name}</h4>
                      <p className="font-sans text-xs uppercase tracking-widest font-black text-slate-500">Equity Partner</p>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 5: Strategic Briefs */}
    <section className="py-40 px-24 bg-white">
       <div className="max-w-5xl mx-auto space-y-24">
          <div className="text-center space-y-6">
             <h2 className="text-5xl font-bold italic">Strategic Insights.</h2>
             <p className="font-sans text-slate-400 text-xs font-black uppercase tracking-widest">Market analysis and regulatory updates</p>
          </div>
          <div className="space-y-16">
             {[
               { title: "Navigating the New EU AI Act", date: "Jan 2025", type: "Brief" },
               { title: "Cross-Border Tax in the Digital Age", date: "Dec 2024", type: "Whitepaper" },
               { title: "Privacy Safeguards for Global SaaS", date: "Nov 2024", type: "Strategy" }
             ].map((brief, i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-12 group cursor-pointer hover:border-slate-900 transition-colors">
                   <div className="space-y-2">
                      <span className="font-sans text-[10px] font-black uppercase tracking-widest text-slate-300">{brief.type} — {brief.date}</span>
                      <h4 className="text-4xl font-bold group-hover:translate-x-4 transition-transform">{brief.title}</h4>
                   </div>
                   <div className="w-16 h-16 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-[#0f172a] group-hover:text-white transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </section>
  </div>
);

const PulseSim = () => (
  <div className="bg-[#ff3e00] text-white font-sans selection:bg-black selection:text-white pb-40">
    <nav className="p-12 flex justify-between items-center fixed w-full top-0 z-50 mix-blend-difference uppercase font-black tracking-tighter text-4xl">
      <div>PULSE.</div>
      <div className="text-xl">☰</div>
    </nav>
    <section className="h-screen flex flex-col justify-end p-12 pb-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35rem] font-black opacity-10 select-none">PULSE</div>
      <h1 className="text-[20rem] font-black leading-[0.7] tracking-tighter animate-in slide-in-from-left-24 duration-1000">BEYOND<br/>DESIGN.</h1>
      <div className="flex justify-between items-end mt-20">
        <p className="text-5xl font-black italic max-w-4xl">A global creative laboratory focused on radical brand transformations.</p>
        <div className="w-24 h-24 border-[10px] border-white flex items-center justify-center text-4xl font-black">→</div>
      </div>
    </section>
    <section className="bg-black py-60 px-12 space-y-60">
       <div className="grid grid-cols-2 gap-32 items-center">
          <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200" className="w-full grayscale hover:grayscale-0 transition-all duration-700 shadow-[0_0_100px_rgba(255,62,0,0.2)]" />
          <div className="space-y-12">
             <h2 className="text-9xl font-black leading-none uppercase">NO RULES.<br/>ONLY IMPACT.</h2>
             <p className="text-2xl text-slate-500 leading-relaxed">Vi följer inte trender. Vi raderar dem. Vårt arbete är högljutt, unapologetic och tekniskt fulländat.</p>
          </div>
       </div>
       <div className="grid grid-cols-3 gap-8">
          {[
            "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600"
          ].map((img, i) => (
             <div key={i} className="aspect-square bg-[#ff3e00] p-0 flex flex-col justify-between overflow-hidden relative group">
                <img src={img} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                <div className="relative z-10 p-12 flex flex-col h-full justify-between pointer-events-none">
                  <span className="text-[10px] font-black tracking-[0.5em]">MODULE 0{i+1}</span>
                  <h4 className="text-6xl font-black leading-none uppercase">DIGITAL<br/>MAYHEM.</h4>
                </div>
             </div>
          ))}
       </div>
    </section>

    {/* Section 3: The Lab */}
    <section className="py-60 px-12 bg-white text-black">
       <div className="max-w-7xl mx-auto grid grid-cols-12 gap-24 items-start">
          <div className="col-span-4 sticky top-40 space-y-12">
             <h2 className="text-9xl font-black tracking-tighter uppercase leading-[0.8]">The Lab.</h2>
             <p className="text-2xl font-black italic">Experimental UI / Generative Code / Radical Simplicity.</p>
             <button className="bg-black text-white px-12 py-6 text-xs font-black uppercase tracking-[0.3em]">Enter Laboratory</button>
          </div>
          <div className="col-span-8 space-y-32">
             {[
               { name: "NEURAL CANVAS", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200" },
               { name: "KINETIC TYPE", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200" },
               { name: "GLITCH PROTOCOL", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200" }
             ].map(item => (
                <div key={item.name} className="space-y-12 group">
                   <div className="aspect-video bg-[#ff3e00] overflow-hidden">
                      <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                   </div>
                   <h3 className="text-7xl font-black tracking-tighter uppercase">{item.name}</h3>
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 4: Manifesto */}
    <section className="py-60 px-12 overflow-hidden text-center relative">
       <div className="text-[30rem] font-black opacity-5 whitespace-nowrap absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">MANIFESTO MANIFESTO</div>
       <div className="max-w-6xl mx-auto relative z-10 space-y-24">
          <h2 className="text-[12rem] font-black italic uppercase leading-none tracking-tighter">We are not<br/>an agency.</h2>
          <p className="text-5xl font-black uppercase leading-tight">Vi är ett biologiskt svar på digital stagnation. Vi monterar ner säkra idéer och ersätter dem med verklighet. Det finns ingen plan B. Bara effekt.</p>
          <div className="grid grid-cols-3 gap-12 text-left">
             <div>
                <span className="text-xl font-black italic text-black/20 block mb-4 underline">01. DESTRUCTION</span>
                <p className="text-sm font-black uppercase tracking-widest leading-relaxed">Kill the ego. Kill the trend. Start from the void.</p>
             </div>
             <div>
                <span className="text-xl font-black italic text-black/20 block mb-4 underline">02. VELOCITY</span>
                <p className="text-sm font-black uppercase tracking-widest leading-relaxed">Speed is the only metric that matters in a dying age.</p>
             </div>
             <div>
                <span className="text-xl font-black italic text-black/20 block mb-4 underline">03. ABSOLUTE</span>
                <p className="text-sm font-black uppercase tracking-widest leading-relaxed">No compromise on design. No compromise on code.</p>
             </div>
          </div>
       </div>
    </section>

    {/* Section 5: The Wall */}
    <section className="py-40 bg-black">
       <div className="flex flex-col gap-8 opacity-20">
          {[1,2,3].map(row => (
             <div key={row} className={`flex gap-8 whitespace-nowrap text-[15rem] font-black uppercase tracking-tighter animate-marquee-${row % 2 === 0 ? 'right' : 'left'}`}>
                <span>COLLABORATION / IMPACT / FUTURE / PULSE / RADICAL / DISRUPTION / PULSE / FUTURE</span>
             </div>
          ))}
       </div>
    </section>
  </div>
);

const EcoGardenSim = () => (
  <div className="bg-[#fcfdfa] text-[#16423c] font-sans selection:bg-[#6a9c89] selection:text-white pb-40">
    <nav className="p-10 border-b border-[#16423c]/5 flex justify-between items-center bg-white sticky top-0 z-50">
      <div className="text-3xl font-black tracking-tighter uppercase text-[#6a9c89]">ECOGARDEN.</div>
      <div className="flex gap-12 text-[11px] font-bold uppercase tracking-widest opacity-60">
        <span>Produkter</span><span>Filosofi</span><span>Konto (0)</span>
      </div>
    </nav>
    <section className="px-12 py-32 grid md:grid-cols-2 gap-24 items-center">
      <div className="space-y-12">
        <span className="bg-[#6a9c89]/10 text-[#6a9c89] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Cirkulär Inredning</span>
        <h1 className="text-9xl font-serif font-black leading-[0.85]">Let home<br/><span className="italic font-normal opacity-40 underline">breathe.</span></h1>
        <p className="text-xl leading-relaxed max-w-lg opacity-70">Hållbart anskaffade växter och handgjorda lergods för den moderna fristaden.</p>
        <button className="bg-[#16423c] text-white px-16 py-6 rounded-full font-bold uppercase text-xs tracking-widest shadow-2xl hover:bg-[#6a9c89] transition-all">Shop Collection</button>
      </div>
      <div className="relative">
        <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1200" className="w-full aspect-[4/5] object-cover rounded-[5rem] shadow-2xl" />
      </div>
    </section>

    {/* Section 2: Curated Collection */}
    <section className="bg-white py-40 px-12">
       <div className="flex justify-between items-end mb-24 max-w-7xl mx-auto">
          <h2 className="text-6xl font-serif font-black text-[#16423c]">Curated for life.</h2>
          <span className="text-xs font-bold border-b-2 border-[#16423c] pb-1 uppercase tracking-widest cursor-pointer">View All</span>
       </div>
       <div className="grid grid-cols-4 gap-12 max-w-7xl mx-auto">
          {[
            { name: "Organic Pot", price: "495:-", img: "https://images.unsplash.com/photo-1580000000000-123456789abc?q=80&w=600" },
            { name: "Hemp Rug", price: "1295:-", img: "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?q=80&w=600" },
            { name: "Hand-Blown Vase", price: "895:-", img: "https://images.unsplash.com/photo-1574482620826-40685ca5eba2?q=80&w=600" },
            { name: "Dried Bloom Set", price: "349:-", img: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600" }
          ].map((item, i) => (
             <div key={i} className="space-y-6 group cursor-pointer">
                <div className="aspect-[3/4] overflow-hidden rounded-[3rem] bg-[#f8faf7] shadow-sm group-hover:shadow-xl transition-all duration-700">
                   <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                </div>
                <div className="flex justify-between font-bold">
                   <span className="text-[#16423c]">{item.name}</span>
                   <span className="text-[#6a9c89]">{item.price}</span>
                </div>
             </div>
          ))}
       </div>
    </section>

    {/* Section 3: The Workshop */}
    <section className="py-40 bg-[#f4f6f0] px-12">
       <div className="max-w-7xl mx-auto grid grid-cols-2 gap-32 items-center">
          <div className="relative">
             <img src="https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=800" className="w-full aspect-square object-cover rounded-[5rem] shadow-2xl" />
             <div className="absolute -bottom-10 -right-10 bg-[#6a9c89] text-white p-12 rounded-[3rem] shadow-2xl">
                <span className="text-6xl font-serif">100%</span>
                <p className="text-[10px] font-black uppercase tracking-widest mt-2">Ethical Craft</p>
             </div>
          </div>
          <div className="space-y-12">
             <h2 className="text-7xl font-serif font-black text-[#16423c] leading-tight">Grown by earth.<br/>Made by hand.</h2>
             <p className="text-xl text-[#6a9c89] font-medium leading-relaxed italic">"Vi anser att föremålen i våra hem ska ha en själ. Därför färdigställs varje del för hand i vår Småländska verkstad med traditionella metoder."</p>
             <div className="space-y-8 pt-8">
                {['Kallpressade hampafibrer', 'Vulkanisk lera från Island', 'Lokalt plockade växter'].map(f => (
                   <div key={f} className="flex items-center space-x-6 border-b border-[#16423c]/10 pb-6">
                      <div className="w-4 h-4 rounded-full border-2 border-[#6a9c89]"></div>
                      <span className="text-sm font-bold uppercase tracking-widest">{f}</span>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </section>

    {/* Section 4: Botanist Journal */}
    <section className="py-40 px-12 bg-white">
       <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center">
             <h2 className="text-6xl font-serif font-black text-[#16423c]">Botanist Journal</h2>
             <p className="text-[#6a9c89] font-black uppercase tracking-[0.3em] text-[10px] mt-4">Vårda din digitala fristad</p>
          </div>
          <div className="grid grid-cols-3 gap-12">
             {[
               { title: "Winter care for succulents", img: "https://images.unsplash.com/photo-1446071103084-c257b5f70672?q=80&w=600" },
               { title: "The art of slow brewing", img: "https://images.unsplash.com/photo-1544666107-509635ff9a58?q=80&w=600" },
               { title: "Drying flowers at home", img: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600" }
             ].map((post, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="aspect-[4/5] overflow-hidden rounded-[3rem] bg-[#f8faf7] mb-8">
                      <img src={post.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Journal — 0{i+1}</span>
                   <h4 className="text-3xl font-serif font-bold mt-4 text-[#16423c] group-hover:text-[#6a9c89] transition-colors">{post.title}</h4>
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 5: Instagram Grid */}
    <section className="py-40 bg-[#fcfdfa] border-t border-[#16423c]/5">
       <div className="max-w-7xl mx-auto px-12 space-y-12">
          <div className="flex justify-between items-center">
             <h3 className="text-2xl font-serif font-bold">@ecogarden_stockholm</h3>
             <span className="text-xs font-black uppercase tracking-widest text-[#6a9c89]">Follow the bloom</span>
          </div>
          <div className="grid grid-cols-6 gap-4">
             {[
                'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a',
                'https://images.unsplash.com/photo-1501004841791-5cff38648396',
                'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735',
                'https://images.unsplash.com/photo-1416870230247-d0a29266596a',
                'https://images.unsplash.com/photo-1495908333425-29a1e0918c5f',
                'https://images.unsplash.com/photo-1470058869958-2a77a6711758'
             ].map((url, i) => (
                <div key={i} className="aspect-square bg-slate-200 rounded-2xl overflow-hidden group">
                   <img src={`${url}?q=80&w=400`} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                </div>
             ))}
          </div>
       </div>
    </section>
  </div>
);

const QuantumAISim = () => (
  <div className="bg-[#050505] text-white font-sans selection:bg-purple-600 pb-40">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
       <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-600/10 blur-[200px] rounded-full"></div>
       <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/10 blur-[180px] rounded-full"></div>
    </div>
    <nav className="p-12 flex justify-between items-center relative z-50">
      <div className="text-3xl font-black uppercase tracking-tighter italic flex gap-4 items-center">
        <div className="w-10 h-10 border-2 border-white rotate-45 flex items-center justify-center"><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div></div>
        QUANTUM AI
      </div>
      <button className="text-[10px] font-black uppercase tracking-widest border border-white/20 px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all">Request API</button>
    </nav>
    <section className="px-12 py-40 text-center relative z-10">
      <h1 className="text-[18rem] font-black leading-[0.7] tracking-tighter mb-24 animate-in zoom-in-110 duration-[2s]">THE RAW<br/>BRAIN.</h1>
      <p className="text-2xl text-slate-400 max-w-5xl mx-auto font-light leading-relaxed mb-32">Bygger den massiva neurala ryggraden för nästa industriella tidsålder. 100T parameter multi-modala modeller tränade på globala dataset.</p>
      <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto">
         {[
           "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800",
           "https://images.unsplash.com/photo-1620712943543-bcc4628c71d0?q=80&w=800",
           "https://images.unsplash.com/photo-1675271591211-126ad94ec90b?q=80&w=800"
         ].map((img, i) => (
            <div key={i} className="aspect-video bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group relative">
               <img src={img} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black tracking-widest opacity-40 group-hover:opacity-100 transition-opacity italic">NODE_{i+1}_STATUS_ACTIVE</span>
               </div>
            </div>
         ))}
      </div>
    </section>

    {/* Section 2: Technical Specs */}
    <section className="py-40 px-12 relative z-10 border-t border-white/5">
       <div className="max-w-7xl mx-auto grid grid-cols-12 gap-24">
          <div className="col-span-4 space-y-12">
             <h2 className="text-6xl font-black italic uppercase leading-none">Compute<br/>Power.</h2>
             <p className="text-slate-500 leading-relaxed">Vår infrastruktur består av proprietära fotoniska processorenheter, designade för de extrema kraven hos flerdimensionella resonemang.</p>
             <ul className="space-y-6">
                {['1.2 Zettaflops total capacity', 'Liquid-immersion cooling', 'Direct fiber neural link', '99.999% system uptime'].map(item => (
                   <li key={item} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500"></div>
                      <span className="text-sm font-bold uppercase tracking-widest">{item}</span>
                   </li>
                ))}
             </ul>
          </div>
          <div className="col-span-8">
             <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=1200" className="w-full rounded-[3rem] border border-white/10" />
          </div>
       </div>
    </section>

    {/* Section 3: Applications */}
    <section className="py-40 px-12 bg-white/5 relative z-10">
       <div className="max-w-7xl mx-auto text-center space-y-24">
          <h2 className="text-7xl font-black uppercase tracking-tighter">Beyond Human Limits.</h2>
          <div className="grid grid-cols-4 gap-8">
             {[
               { title: "Synthetic Biology", icon: "🧬" },
               { title: "Quantum Physics", icon: "⚛️" },
               { title: "Global Climate", icon: "🌍" },
               { title: "Financial Core", icon: "💎" }
             ].map(app => (
                <div key={app.title} className="p-12 border border-white/10 rounded-[2.5rem] hover:bg-white hover:text-black transition-all duration-500 group">
                   <div className="text-6xl mb-8 grayscale group-hover:grayscale-0 transition-all">{app.icon}</div>
                   <h4 className="text-2xl font-black uppercase tracking-tighter">{app.title}</h4>
                   <p className="mt-4 text-xs opacity-40 font-bold uppercase tracking-widest leading-relaxed">Massive-scale simulations for the next epoch.</p>
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 4: Mission */}
    <section className="py-60 px-12 relative z-10 overflow-hidden">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40rem] font-black text-white/5 select-none pointer-events-none">NEURAL</div>
       <div className="max-w-4xl mx-auto text-center space-y-12">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-500">The Mission Statement</span>
          <h3 className="text-9xl font-black tracking-tighter italic leading-none">Intelligens är den nya elektriciteten.</h3>
          <p className="text-2xl text-slate-400 font-light leading-relaxed">Vi bygger inte verktyg; vi bygger substratet på vilket framtidens civilisation kommer att beräknas. Vårt mål är att lösa det olösliga.</p>
          <button className="bg-purple-600 text-white px-20 py-8 rounded-full font-black uppercase tracking-widest mt-12 hover:scale-105 transition-all shadow-[0_0_50px_rgba(147,51,234,0.4)]">Initialize Protocol</button>
       </div>
    </section>
  </div>
);

const NordicSim = () => (
  <div className="bg-white text-slate-800 font-sans selection:bg-slate-900 selection:text-white pb-40">
    <nav className="px-12 py-10 flex justify-between items-center border-b border-slate-50">
      <div className="text-2xl font-light tracking-[0.5em] uppercase">NORDIC HOME</div>
      <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span className="text-slate-900 border-b border-slate-900">Objekt</span><span>Värdering</span><span>Kontakt</span>
      </div>
    </nav>
    <section className="px-12 py-32 grid grid-cols-12 gap-24 items-center">
      <div className="col-span-4 space-y-12">
        <h1 className="text-9xl font-serif font-black leading-[0.8] tracking-tighter">Living<br/>Art.</h1>
        <p className="text-xl text-slate-400 leading-relaxed font-light">Vi kurerar bostäder som inspirerar. Nordisk minimalism möter internationell lyx i vår exklusiva portfölj.</p>
        <button className="bg-slate-900 text-white px-16 py-6 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all">Explore Listings</button>
      </div>
      <div className="col-span-8">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200" className="w-full aspect-[16/10] object-cover rounded-sm shadow-3xl" />
      </div>
    </section>

    {/* Section 2: Current Curations */}
    <section className="bg-slate-50 py-40 px-12 space-y-24">
       <h2 className="text-6xl font-serif font-black text-center">Current Curations</h2>
       <div className="grid grid-cols-2 gap-12 max-w-7xl mx-auto">
          {[
            { name: "The Glass Pavilion", price: "42.5 MSEK", img: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1000" },
            { name: "Monolith Residence", price: "28.9 MSEK", img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000" }
          ].map((item, i) => (
             <div key={i} className="space-y-8 group cursor-pointer">
                <div className="aspect-video bg-white overflow-hidden shadow-xl rounded-sm">
                   <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2s]" />
                </div>
                <div className="flex justify-between items-end border-l-4 border-slate-900 pl-8">
                   <h3 className="text-4xl font-serif font-bold tracking-tight">{item.name}</h3>
                   <span className="text-xs uppercase tracking-widest opacity-40 font-bold">{item.price}</span>
                </div>
             </div>
          ))}
       </div>
    </section>

    {/* Section 3: The Philosophy */}
    <section className="py-40 px-12 grid grid-cols-2 gap-32 items-center max-w-7xl mx-auto">
       <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800" className="w-full aspect-square object-cover grayscale brightness-110 shadow-2xl" />
       <div className="space-y-12">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">The Nordic Way</span>
          <h2 className="text-7xl font-serif leading-tight">Simplicity is the ultimate sophistication.</h2>
          <p className="text-xl text-slate-500 leading-relaxed font-light italic">"Vårt uppdrag är att hitta hem som inte bara ger skydd, utan ger frid. Varje linje, varje skugga, varje material väljs med avsikt."</p>
          <div className="grid grid-cols-2 gap-8 pt-8">
             <div>
                <h4 className="text-4xl font-serif font-bold mb-4">420+</h4>
                <p className="text-xs uppercase tracking-widest font-black opacity-30">Properties Sold</p>
             </div>
             <div>
                <h4 className="text-4xl font-serif font-bold mb-4">12B+</h4>
                <p className="text-xs uppercase tracking-widest font-black opacity-30">Total Volume</p>
             </div>
          </div>
       </div>
    </section>

    {/* Section 4: Services */}
    <section className="py-40 px-12 bg-slate-900 text-white">
       <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-32">
             <h2 className="text-8xl font-serif font-black tracking-tighter">Bespoke<br/>Services.</h2>
             <button className="bg-white text-slate-950 px-16 py-8 rounded-full font-bold uppercase text-[10px] tracking-widest mb-4">Book Valuation</button>
          </div>
          <div className="grid grid-cols-3 gap-16">
             {[
               { title: "Off-Market", desc: "Access to the most exclusive properties before they reach the public domain." },
               { title: "Valuation", desc: "Scientific approach combined with deep market intuition for accurate pricing." },
               { title: "Interior Strategy", desc: "Transforming spaces to maximize emotional and financial impact." }
             ].map(s => (
                <div key={s.title} className="space-y-8 border-t border-white/10 pt-12 group">
                   <h4 className="text-3xl font-serif font-bold group-hover:italic transition-all">{s.title}</h4>
                   <p className="text-slate-400 leading-relaxed font-light">{s.desc}</p>
                   <div className="w-12 h-px bg-white/20 group-hover:w-full transition-all duration-500"></div>
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 5: Neighborhoods */}
    <section className="py-40 px-12">
       <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
             <h2 className="text-6xl font-serif font-black">Global Reach. Local Heart.</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Utforska våra primära domäner</p>
          </div>
          <div className="grid grid-cols-4 gap-8">
             {[
                { name: 'Östermalm', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c' },
                { name: 'Djurgården', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750' },
                { name: 'Bromma', img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233' },
                { name: 'Skärgården', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853' }
             ].map(hood => (
                <div key={hood.name} className="aspect-[3/4] bg-slate-100 group overflow-hidden relative">
                   <img src={`${hood.img}?q=80&w=600`} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <h4 className="text-white text-3xl font-serif font-bold tracking-tight relative z-10 group-hover:scale-110 transition-transform">{hood.name}</h4>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </section>
  </div>
);

const FitnessSim = () => (
  <div className="bg-black text-white font-sans selection:bg-[#ef4444] pb-40">
    <nav className="p-8 flex justify-between items-center bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
      <div className="text-4xl font-black italic tracking-tighter skew-x-[-15deg] uppercase">VANTAGE.</div>
      <button className="bg-[#ef4444] px-12 py-4 font-black uppercase text-[11px] tracking-widest skew-x-[-10deg]">Join Tribe</button>
    </nav>
    <section className="relative h-screen flex items-center px-12 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600" className="absolute inset-0 w-full h-full object-cover opacity-60 brightness-75 grayscale" />
      <div className="relative z-10 space-y-12">
        <h1 className="text-[18rem] font-black italic leading-[0.7] tracking-tighter uppercase animate-in slide-in-from-left-24 duration-1000">REWRITE<br/>LIMITS.</h1>
        <p className="text-4xl font-black italic uppercase max-w-4xl border-l-[15px] border-[#ef4444] pl-12">Revolutionera din biologi. Stockholms mest exklusiva träningsanläggning.</p>
        <div className="flex gap-8">
           <button className="bg-white text-black px-16 py-8 font-black uppercase text-xs tracking-widest skew-x-[-10deg] shadow-3xl">Book Intro</button>
           <button className="border-4 border-white px-16 py-8 font-black uppercase text-xs tracking-widest skew-x-[-10deg]">The Compound</button>
        </div>
      </div>
    </section>
    <section className="py-40 grid grid-cols-4 gap-4 px-4 bg-white">
       {[
         { name: "Iron Lab", img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600" },
         { name: "Recovery Hub", img: "https://images.unsplash.com/photo-1517836357463-d25fed2f01d8?q=80&w=600" },
         { name: "Velocity Zone", img: "https://images.unsplash.com/photo-1534367507873-d2b7e2495942?q=80&w=600" },
         { name: "Zen Compound", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2158?q=80&w=600" }
       ].map((module, i) => (
          <div key={i} className="aspect-[3/5] bg-black relative group overflow-hidden">
             <img src={module.img} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
             <div className="absolute inset-0 flex flex-col justify-end p-12 space-y-4 bg-gradient-to-t from-black to-transparent">
                <h4 className="text-5xl font-black italic uppercase skew-x-[-10deg] tracking-tighter">{module.name}</h4>
                <p className="text-[#ef4444] font-black uppercase tracking-widest text-[10px]">Power & Performance</p>
             </div>
          </div>
       ))}
    </section>

    {/* Section 3: The Philosophy */}
    <section className="py-60 px-12 max-w-7xl mx-auto grid grid-cols-2 gap-32 items-center">
       <div className="space-y-12">
          <span className="text-[#ef4444] font-black uppercase tracking-[0.5em] text-[10px]">The Ethos</span>
          <h2 className="text-9xl font-black italic tracking-tighter uppercase leading-none">Pain is<br/>Information.</h2>
          <p className="text-2xl text-slate-400 font-light leading-relaxed uppercase">Vi räknar inte reps. Vi räknar resultat. Vår träningsmetodik är rotad i datadriven hypertrofi och kognitiv resiliens.</p>
          <div className="flex gap-12">
             <div className="space-y-4">
                <span className="text-6xl font-black text-white italic">0%</span>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Compromise</p>
             </div>
             <div className="space-y-4">
                <span className="text-6xl font-black text-white italic">100%</span>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Execution</p>
             </div>
          </div>
       </div>
       <div className="p-8 border-[20px] border-white/5">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800" className="w-full grayscale brightness-125" />
       </div>
    </section>

    {/* Section 4: Membership Tiers */}
    <section className="py-40 bg-white/5 border-y border-white/10">
       <div className="max-w-7xl mx-auto px-12">
          <div className="text-center mb-32 space-y-6">
             <h2 className="text-8xl font-black italic uppercase tracking-tighter">Choose Your Battle.</h2>
             <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Begränsad tillgänglighet per kohort</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
             {[
               { tier: "Elite", price: "2499:-", items: ["24/7 Biometric Access", "Group Combat Prep", "Recovery Lounge"] },
               { tier: "Sovereign", price: "4999:-", items: ["Personalized Hormone Plan", "Weekly Neuro-Scan", "Private Trainer"] },
               { tier: "Vantage Prime", price: "9999:-", items: ["Private Quarter Access", "Global Facility Passport", "DNA-Tailored Diet"] }
             ].map(t => (
                <div key={t.tier} className="bg-black border border-white/10 p-16 space-y-12 hover:border-[#ef4444] transition-all group">
                   <h4 className="text-4xl font-black italic uppercase skew-x-[-10deg]">{t.tier}</h4>
                   <div className="text-6xl font-black italic text-white">{t.price}<span className="text-sm opacity-30 italic font-normal"> /mo</span></div>
                   <ul className="space-y-4 opacity-40 group-hover:opacity-100 transition-opacity">
                      {t.items.map(item => <li key={item} className="text-[10px] font-black uppercase tracking-widest">→ {item}</li>)}
                   </ul>
                   <button className="w-full border-2 border-white py-6 font-black uppercase tracking-widest text-[10px] group-hover:bg-[#ef4444] group-hover:border-[#ef4444] transition-all">Select Protocol</button>
                </div>
             ))}
          </div>
       </div>
    </section>

    {/* Section 5: The Team */}
    <section className="py-60 px-12 text-center">
       <h2 className="text-9xl font-black italic uppercase tracking-tighter mb-40">The Architects.</h2>
       <div className="grid grid-cols-4 gap-12 max-w-7xl mx-auto">
          {[
             { name: 'Alex Thorne', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48' },
             { name: 'Sarah Vane', img: 'https://images.unsplash.com/photo-1548690312-e3b507d17a47' },
             { name: 'Mark Jovic', img: 'https://images.unsplash.com/photo-1506794778242-9064223a4192' },
             { name: 'Elena Rossi', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce' }
          ].map(person => (
             <div key={person.name} className="space-y-8 group">
                <div className="aspect-[3/4] bg-white/5 grayscale group-hover:grayscale-0 transition-all duration-1000 overflow-hidden">
                   <img src={`${person.img}?q=80&w=600`} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-all duration-1000" />
                </div>
                <div className="text-left space-y-2">
                   <h4 className="text-2xl font-black italic uppercase skew-x-[-5deg] tracking-tight">{person.name}</h4>
                   <p className="text-[9px] font-black uppercase tracking-widest text-[#ef4444]">Head Performance Lead</p>
                </div>
             </div>
          ))}
       </div>
    </section>
  </div>
);

// --- MAIN PORTFOLIO COMPONENT ---

const SimulatedSite: React.FC<{ item: typeof portfolioItems[0] }> = ({ item }) => {
  switch (item.id) {
    case 1: return <LumeSim />;
    case 2: return <SavorSim />;
    case 3: return <NovaSim />;
    case 4: return <VantageLegalSim />;
    case 5: return <PulseSim />;
    case 6: return <EcoGardenSim />;
    case 7: return <QuantumAISim />;
    case 8: return <NordicSim />;
    case 9: return <FitnessSim />;
    default: return null;
  }
};

export const Portfolio: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<typeof portfolioItems[0] | null>(null);

  useEffect(() => {
    if (selectedItem) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [selectedItem]);

  return (
    <section className="pt-32 pb-40 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto mb-24 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Referensarkiv</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900">
            Exellenta <span className="italic text-blue-600">resultat.</span>
          </h2>
          <p className="text-slate-500 text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto">
            Vi bygger inte bara hemsidor – vi skapar digitala upplevelser som driver affärer. Se våra 9 utvalda projekt nedan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {portfolioItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative aspect-[16/11] overflow-hidden rounded-[3rem] bg-slate-100 shadow-sm transition-all duration-700 group-hover:shadow-[0_60px_100px_-30px_rgba(0,0,0,0.2)] group-hover:-translate-y-6">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-12">
                  <span className="block text-white font-bold text-[11px] uppercase tracking-[0.3em] transform translate-y-4 group-hover:translate-y-0 transition-transform">Starta Live Demo</span>
                </div>
              </div>

              <div className="mt-10 space-y-3 px-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{item.category}</span>
                </div>
                <h3 className="text-4xl font-bold tracking-tighter group-hover:text-blue-600 transition-colors duration-300">{item.title}</h3>
                <div className="flex gap-4 pt-2">
                   {item.tags.slice(0, 2).map(tag => (
                     <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-slate-300">#{tag}</span>
                   ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-12 overflow-hidden animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" onClick={() => setSelectedItem(null)}></div>
          
          <div className="relative bg-white w-full h-full max-w-[1700px] rounded-none md:rounded-[4rem] overflow-y-auto scrollbar-hide shadow-4xl animate-in zoom-in-95 slide-in-from-bottom-32 duration-1000">
            
            <div className="flex items-center justify-between px-12 py-8 border-b border-slate-100 bg-white sticky top-0 z-[110]">
              <div className="flex items-center space-x-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase">{selectedItem.title}</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedItem.category}</p>
                </div>
                <div className="hidden lg:flex items-center space-x-12 border-l border-slate-100 pl-12">
                   {[ ["Laddning", selectedItem.stats.speed], ["SEO", selectedItem.stats.seo+"/100"], ["Konvertering", selectedItem.stats.conversion] ].map(([label, val]) => (
                     <div key={label} className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-sm font-black text-slate-900">{val}</p>
                     </div>
                   ))}
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="w-14 h-14 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="bg-white">
              <div className="max-w-full mx-auto">
                <div className="bg-slate-100 px-10 py-5 flex items-center space-x-6 border-b border-slate-200">
                  <div className="flex space-x-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-inner"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-inner"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-inner"></div>
                  </div>
                  <div className="flex-grow bg-white rounded-xl py-2 px-6 text-[11px] text-slate-400 font-bold overflow-hidden whitespace-nowrap border border-slate-200/50 italic">
                    https://demo.webfabriken.se/{selectedItem.title.toLowerCase().replace(/\s+/g, '-')}
                  </div>
                </div>
                <div className="relative">
                   <SimulatedSite item={selectedItem} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
