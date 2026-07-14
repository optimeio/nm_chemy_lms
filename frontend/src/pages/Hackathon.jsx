import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Trophy,
  Users,
  Code2,
  Presentation,
  ClipboardList,
  Award,
  Download,
  MapPin,
  CalendarDays,
  Clock,
  Copy,
  Check,
  Coffee,
  Sparkles,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

const DEFAULT_EVENT_DATE = new Date("2026-07-18T09:00:00");

const DEFAULT_SLIDES = [
  {
    title: "Naan Mudhalvan Hackathon 2026",
    tag: "Opening Ceremony",
    icon: Sparkles,
    from: "from-blue-600 to-indigo-700",
    desc: "Join the grand opening of Tamil Nadu's premier tech hackathon and kickstart your 48-hour journey.",
  },
  {
    title: "48-Hour Build Sprint",
    tag: "Team Coding",
    icon: Code2,
    from: "from-indigo-600 to-purple-700",
    desc: "Collaborate, write clean code, design robust prototypes, and turn your abstract ideas into reality.",
  },
  {
    title: "Mentor Roundtable",
    tag: "Guidance Sessions",
    icon: Users,
    from: "from-purple-600 to-pink-700",
    desc: "Get 1-on-1 guidance from top industry experts to unblock, refine, and polish your application.",
  },
  {
    title: "Live Project Demos",
    tag: "Showcase & Pitch",
    icon: Presentation,
    from: "from-blue-600 to-cyan-700",
    desc: "Present your completed application to an elite panel of judges and stand out from the crowd.",
  },
];

const DEFAULT_STATS = [
  { label: "Teams Registered", value: "128", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Prize Pool", value: "₹2,00,000", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Duration", value: "48 Hrs", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Expert Mentors", value: "24+", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
];

const DEFAULT_TIMELINE = {
  "Day 1": [
    { time: "08:00 AM", title: "Registrations & Reporting", desc: "Arrive at the Naan Mudhalvan Training Block, collect your kits, and verify team registration.", icon: ClipboardList },
    { time: "09:30 AM", title: "Inaugural Ceremony", desc: "Keynote talks by chief guests and release of exact problem statement variations.", icon: Sparkles },
    { time: "11:00 AM", title: "Hacking Begins!", desc: "The countdown starts. Brainstorming, architectural design, and repository setup.", icon: Code2 },
    { time: "04:00 PM", title: "First Progress Check", desc: "Sync with floor mentors for architectural validation and tech-stack review.", icon: Users },
  ],
  "Day 2": [
    { time: "09:00 AM", title: "Mid-way Pitch Prep", desc: "Workshops on how to effectively structure your project pitch and highlight USP.", icon: Presentation },
    { time: "02:00 PM", title: "Detailed Mentor Review", desc: "One-on-one evaluations. Mentors inspect working prototypes and provide feedback.", icon: Users },
    { time: "09:00 PM", title: "Late Night Code Freeze Support", desc: "Volunteers and tech experts help you debug critical production errors before freeze.", icon: Code2 },
  ],
  "Day 3": [
    { time: "08:00 AM", title: "Deployment & Code Freeze", desc: "Submit your final code repository links and production deployment URLs.", icon: ClipboardList },
    { time: "10:00 AM", title: "Jury Demo Rounds", desc: "Presentation slots in front of the final evaluation panel. 7-min pitch + 3-min Q&A.", icon: Presentation },
    { time: "04:00 PM", title: "Valedictory & Awards", desc: "Announcement of category winners and distribution of certificates/prizes.", icon: Trophy },
  ],
};

const FAQ = [
  { q: "What should we bring to the venue?", a: "Bring your laptops, chargers, extension cords, water bottles, and college identity cards. Wi-Fi credentials will be provided on arrival." },
  { q: "Can we use pre-built components?", a: "Any open-source library or pre-built component/template is allowed, but all core logic and project integration must be built during the 48 hours." },
  { q: "What is the maximum team size?", a: "Teams must consist of 2 to 4 members. Individual participants will be assisted in team formulation during the Day 1 morning networking session." },
];

function useCountdown(targetDate) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, new Date(targetDate).getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
}

export default function Hackathon() {
  const [copied, setCopied] = useState(false);
  const [images, setImages] = useState([]);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [activeDay, setActiveDay] = useState("Day 1");
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeShowcaseSlide, setActiveShowcaseSlide] = useState(0);
  
  // Custom Hackathon from database
  const [customHackathon, setCustomHackathon] = useState(null);

  useEffect(() => {
    // Fetch custom targeted active hackathon for student
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/hackathon/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.title) {
            setCustomHackathon(data);
          }
        })
        .catch(err => console.error("Error loading custom hackathon:", err));
    }
  }, []);

  const eventDate = customHackathon ? new Date(customHackathon.eventDate) : DEFAULT_EVENT_DATE;
  const countdown = useCountdown(eventDate);

  const fallbackImages = [
    { url: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=800&q=80', originalName: 'Collaborative Coding' },
    { url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80', originalName: 'Hardware Integration' },
    { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', originalName: 'System Testing' },
    { url: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41e0?auto=format&fit=crop&w=800&q=80', originalName: 'Brainstorming session' },
  ];

  const showcaseSlides = images.length > 0 ? images.slice(0, 5) : fallbackImages;

  useEffect(() => {
    fetch('/api/hackathon/images')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setImages(data.slice(0, 5));
        } else {
          setImages([]);
        }
      })
      .catch(() => {
        setImages([]);
      });
  }, []);

  // Auto-scroll slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    const address = customHackathon?.venue || 'Chemy Innovation Campus, Naan Mudhalvan Training Block, Anna Salai, Chennai, Tamil Nadu 600002';
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Resolve dynamic stats
  const displayStats = customHackathon && customHackathon.stats && customHackathon.stats.length > 0
    ? customHackathon.stats.map((s, idx) => {
        const icons = [Users, Trophy, Clock, Sparkles];
        const colors = ["text-blue-600", "text-amber-500", "text-emerald-600", "text-purple-600"];
        const bgs = ["bg-blue-50", "bg-amber-50", "bg-emerald-50", "bg-purple-50"];
        return {
          label: s.label,
          value: s.value,
          icon: icons[idx % 4],
          color: colors[idx % 4],
          bg: bgs[idx % 4]
        };
      })
    : DEFAULT_STATS;

  // Resolve dynamic timeline
  const displayTimeline = {};
  if (customHackathon && customHackathon.timeline && customHackathon.timeline.length > 0) {
    customHackathon.timeline.forEach((item) => {
      const day = item.day || "Day 1";
      if (!displayTimeline[day]) displayTimeline[day] = [];
      
      const icons = [ClipboardList, Sparkles, Code2, Users, Presentation, Trophy];
      const randIcon = icons[displayTimeline[day].length % icons.length];
      
      displayTimeline[day].push({
        time: item.time,
        title: item.title,
        desc: item.desc,
        icon: randIcon
      });
    });
  } else {
    Object.assign(displayTimeline, DEFAULT_TIMELINE);
  }

  // Ensure activeDay tab exists in current timeline keys
  const dayKeys = Object.keys(displayTimeline);
  const currentActiveDay = dayKeys.includes(activeDay) ? activeDay : dayKeys[0] || "Day 1";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between py-6">
          <button 
            type="button" 
            onClick={() => window.history.back()} 
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition" /> Back to Dashboard
          </button>
        </div>

        {/* Hero Section Banner */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 shadow-xl shadow-slate-200/50 text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
                <Sparkles size={12} /> {customHackathon?.edition || "Naan Mudhalvan · 2026 Edition"}
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
                {customHackathon?.title || "Hackathon Sprint"}
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
                {customHackathon?.description || "Build, pitch, and ship in 48 hours. Explore live updates, track the timeline, access resources, and discover location details here."}
              </p>
            </div>

            {/* Live Countdown Box */}
            <div className="flex flex-col items-center lg:items-end justify-center">
              <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <div className="text-center lg:text-left mb-3">
                  <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Time Remaining to Launch</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hours' },
                    { value: countdown.mins, label: 'Mins' },
                    { value: countdown.secs, label: 'Secs' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 rounded-xl p-2.5">
                      <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums text-white">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-300 mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS Quick Overview Grid */}
        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, idx) => {
            const Icon = stat.icon || Sparkles;
            return (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition hover:shadow-md min-w-0">
                <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mt-0.5 truncate">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Areas */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Features & Interactive Timeline */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Spotlight Showcase Slider */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Spotlight Events</h3>
                  <p className="text-xs text-slate-500">Major highlights of the 3-day coding sprint.</p>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setActiveSlide((prev) => (prev - 1 + DEFAULT_SLIDES.length) % DEFAULT_SLIDES.length)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setActiveSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className={`rounded-2xl bg-gradient-to-br ${DEFAULT_SLIDES[activeSlide].from} text-white p-6 sm:p-8 relative min-h-[160px] flex flex-col justify-between overflow-hidden shadow-inner`}>
                  <div className="flex justify-between items-start">
                    <span className="inline-flex rounded-full bg-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                      {DEFAULT_SLIDES[activeSlide].tag}
                    </span>
                    <div className="bg-white/20 p-2.5 rounded-xl">
                      {(() => {
                        const IconComp = DEFAULT_SLIDES[activeSlide].icon;
                        return <IconComp size={20} />;
                      })()}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-xl sm:text-2xl font-bold">{DEFAULT_SLIDES[activeSlide].title}</h4>
                    <p className="text-sm text-white/80 mt-2 max-w-xl">{DEFAULT_SLIDES[activeSlide].desc}</p>
                  </div>
                </div>
                <div className="flex justify-center gap-1.5 mt-4">
                  {DEFAULT_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === activeSlide ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Timeline Tabs */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Agenda & Schedule</h3>
                  <p className="text-xs text-slate-500">Track all sessions, reviews, and ceremonies.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {dayKeys.map((day) => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${currentActiveDay === day ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flow-root">
                <ul className="-mb-8">
                  {displayTimeline[currentActiveDay]?.map((event, idx) => {
                    const EvIcon = event.icon || ClipboardList;
                    return (
                      <li key={idx}>
                        <div className="relative pb-8">
                          {idx !== displayTimeline[currentActiveDay].length - 1 && (
                            <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                          )}
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-8 ring-white">
                                <EvIcon size={18} />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 py-1">
                              <div className="flex justify-between items-center gap-4">
                                <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                  {event.time}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{event.desc}</p>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Venue & logistics section removed */}

          </div>

          {/* RIGHT COLUMN: Media Showcase & FAQs */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Visual Image Showcase Slider */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Gallery</h3>
                  <p className="text-[11px] text-slate-400">Glimpses of past events.</p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {showcaseSlides.length} Items
                </span>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-slate-100 group min-h-[220px]">
                <img
                  src={showcaseSlides[activeShowcaseSlide].url}
                  alt={showcaseSlides[activeShowcaseSlide].originalName || "Showcase"}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500"
                  onError={() => setImageLoadError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                  <p className="text-xs font-bold text-white tracking-wide">
                    {showcaseSlides[activeShowcaseSlide].originalName || `Highlight #${activeShowcaseSlide + 1}`}
                  </p>
                </div>

                {/* Left/Right Controls overlay */}
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setActiveShowcaseSlide((prev) => (prev - 1 + showcaseSlides.length) % showcaseSlides.length)}
                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setActiveShowcaseSlide((prev) => (prev + 1) % showcaseSlides.length)}
                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Showcase Indicators */}
              <div className="flex justify-center gap-1 mt-3">
                {showcaseSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveShowcaseSlide(index)}
                    className={`h-1.5 rounded-full transition-all ${index === activeShowcaseSlide ? 'w-4 bg-slate-800' : 'w-1.5 bg-slate-200'}`}
                  />
                ))}
              </div>
            </div>

            {/* Quick Help / FAQ */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" /> Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {FAQ.map((faq, idx) => (
                  <div key={idx} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <p className="text-xs font-bold text-slate-800">{faq.q}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Support Box */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 p-6">
              <h4 className="text-sm font-bold text-blue-900">Need Immediate Help?</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Our support team and student coordinators are online. Get quick clarifications on submission guidelines or query resolution.
              </p>
              <a 
                href="mailto:support@chemy.lms"
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-blue-200 hover:border-blue-300 py-2 text-xs font-bold text-blue-700 transition"
              >
                Email Support Office <ExternalLink size={12} />
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
