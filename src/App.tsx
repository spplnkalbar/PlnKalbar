import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Share2, Zap, Flag, Globe, Camera, X, MapPin, Mail, Phone, Menu, User, Image as ImageIcon } from 'lucide-react';
import { plnArticles, nasionalArticles, internasionalArticles, Article, activityPhotos, ActivityPhoto } from './data';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'pln' | 'nasional' | 'internasional'>('pln');
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ActivityPhoto | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentArticles = activeTab === 'pln' 
    ? plnArticles 
    : activeTab === 'nasional' 
      ? nasionalArticles 
      : internasionalArticles;

  const featuredArticle = currentArticles[0];
  const additionalArticles = currentArticles.slice(1);

  const allArticles = [...plnArticles, ...nasionalArticles, ...internasionalArticles];
  const selectedArticle = allArticles.find((a) => a.id === selectedId);

  // When an article/gallery/profile is selected, disable background scrolling
  useEffect(() => {
    if (selectedId || isPhotoGalleryOpen || isProfileOpen || selectedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedId, isPhotoGalleryOpen, isProfileOpen, selectedPhoto]);

  return (
    <div className="min-h-screen font-sans text-stone-900 selection:bg-red-600 selection:text-white relative z-0">
      {/* Base Background Environment */}
      <div className="fixed inset-0 bg-white -z-30 pointer-events-none" />

      {/* Background Backdrop Logo (More Prominent) */}
      <div className="fixed top-28 inset-x-0 bottom-0 -z-20 pointer-events-none flex items-center justify-center p-8 opacity-[0.25]">
        <img 
          src="https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w2000" 
          alt="Backdrop SP PLN" 
          className="max-h-full max-w-full w-[80vw] md:w-[50vw] lg:w-[35vw] object-contain" 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Transparent App Overlay (Glassmorphism effect over the logo) */}
      <div className="fixed inset-0 bg-white/20 backdrop-blur-[3px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <motion.header
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 border-b border-[#860120] ${
          isScrolled ? 'bg-[#860120]/95 backdrop-blur-md shadow-md' : 'bg-[#860120]/90 backdrop-blur-md'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[86px] flex items-center justify-between text-white select-none">
          <div 
            onClick={() => {
              setSelectedId(null);
              setIsPhotoGalleryOpen(false);
              setIsProfileOpen(false);
              setSelectedPhoto(null);
            }}
            className="flex items-center gap-3 cursor-pointer shrink-0"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000" 
              alt="Logo SP PLN" 
              className="w-[88px] h-[98px] object-contain hover:scale-105 transition-transform duration-300" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div 
            onClick={() => {
              setSelectedId(null);
              setIsPhotoGalleryOpen(false);
              setIsProfileOpen(false);
              setSelectedPhoto(null);
            }}
            className="font-serif text-xl sm:text-2xl lg:text-3.5xl font-bold tracking-wide drop-shadow-md text-center px-4 whitespace-nowrap truncate cursor-pointer hover:opacity-90 transition-opacity flex-1"
          >
            Berita SP PLN Kalimantan Barat
          </div>
          <div className="relative flex items-center gap-2.5 sm:gap-4 font-sans pointer-events-auto">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
              >
                <Menu size={16} />
                <span className="hidden sm:inline">Menu</span>
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />
                )}
                {isMenuOpen && (
                  <motion.div
                    key="menu-content"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden font-sans z-50 text-stone-800"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(true);
                          setIsPhotoGalleryOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-stone-50 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <User size={16} className="text-teal-600 shrink-0" />
                        <span className="font-semibold">Profil</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsPhotoGalleryOpen(true);
                          setIsProfileOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-stone-50 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <ImageIcon size={16} className="text-teal-600 shrink-0" />
                        <span className="font-semibold">Foto Kegiatan</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex items-center justify-between border-b border-stone-300/70 pb-4"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold text-stone-900 animate-fade-in">
            Edisi Hari Ini
          </h1>
          <div className="hidden md:block text-sm font-medium text-stone-500 uppercase tracking-widest">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </motion.div>

        {/* Tab Pages / Categories Selector */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12 flex items-center overflow-x-auto no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0 py-1 gap-3 scroll-smooth select-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            id="tab-pln"
            onClick={() => setActiveTab('pln')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 md:hover:-translate-y-0.5 pointer-events-auto shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border cursor-pointer ${
              activeTab === 'pln'
                ? 'bg-[#860120] text-white border-[#860120] shadow-md shadow-[#860120]/20 font-black'
                : 'bg-white/80 text-stone-700 hover:bg-stone-50 hover:text-red-600 border-white/60 backdrop-blur-md'
            }`}
          >
            <span>Berita SP PLN Kalbar</span>
          </button>
          
          <button
            id="tab-nasional"
            onClick={() => setActiveTab('nasional')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 md:hover:-translate-y-0.5 pointer-events-auto shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border cursor-pointer ${
              activeTab === 'nasional'
                ? 'bg-[#860120] text-white border-[#860120] shadow-md shadow-[#860120]/20 font-black'
                : 'bg-white/80 text-stone-700 hover:bg-stone-50 hover:text-red-600 border-white/60 backdrop-blur-md'
            }`}
          >
            <span>Berita Nasional</span>
          </button>

          <button
            id="tab-internasional"
            onClick={() => setActiveTab('internasional')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 md:hover:-translate-y-0.5 pointer-events-auto shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border cursor-pointer ${
              activeTab === 'internasional'
                ? 'bg-[#860120] text-white border-[#860120] shadow-md shadow-[#860120]/20 font-black'
                : 'bg-white/80 text-stone-700 hover:bg-stone-50 hover:text-red-600 border-white/60 backdrop-blur-md'
            }`}
          >
            <span>Berita Internasional</span>
          </button>
        </motion.div>

        {/* Featured Article & Sub Articles Section with dynamic key for smooth transitions */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {featuredArticle && (
            <div className="mb-16">
              <motion.div
                
                className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/75 backdrop-blur-md rounded-[2rem] p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(134,1,32,0.12)] border border-stone-200/50 transition-all duration-500 hover:-translate-y-2"
                onClick={() => setSelectedId(featuredArticle.id)}
              >
                <div className="lg:col-span-8 overflow-hidden rounded-3xl relative aspect-[16/10] shadow-inner font-sans">
                  <motion.img
                    
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl pointer-events-none" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-4 py-2 bg-black/85 backdrop-blur-md text-xs font-bold uppercase tracking-wider rounded-full shadow-md text-stone-100 border border-white/10">
                      {featuredArticle.category}
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col justify-center px-4 sm:px-2 font-sans">
                  <motion.div  className="flex items-center space-x-3 text-sm text-stone-800 mb-5 font-semibold">
                    <span className="text-red-700 font-extrabold">{featuredArticle.author}</span>
                    <span className="text-stone-400">&bull;</span>
                    <span className="flex items-center text-stone-900"><Clock size={16} className="mr-1.5 opacity-80" /> {featuredArticle.readTime}</span>
                  </motion.div>
                  <motion.h2
                    
                    className="font-serif text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-5 text-gray-950 group-hover:text-red-700 transition-colors duration-300 drop-shadow-sm"
                  >
                    {featuredArticle.title}
                  </motion.h2>
                  <motion.p
                    
                    className="text-stone-900 text-lg font-medium leading-relaxed line-clamp-3"
                  >
                    {featuredArticle.excerpt}
                  </motion.p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Sub Articles Grid */}
          {additionalArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-stone-300 pt-16">
              {additionalArticles.map((article, index) => (
                <motion.div
                  
                  key={article.id}
                  className="group cursor-pointer flex flex-col bg-white/75 backdrop-blur-md rounded-[2rem] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(134,1,32,0.12)] border border-stone-200/50 transition-all duration-500 hover:-translate-y-2 relative font-sans"
                  onClick={() => setSelectedId(article.id)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="overflow-hidden rounded-3xl aspect-[4/3] mb-5 relative shadow-inner">
                    <motion.img
                      
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl pointer-events-none" />
                  </div>
                  <div className="flex flex-col flex-1 px-3 pb-3">
                    <motion.div  className="flex items-center space-x-2 text-xs text-stone-800 mb-4 uppercase tracking-wider font-bold">
                      <span className="text-red-700">{article.category}</span>
                      <span className="text-stone-400">&bull;</span>
                      <span className="text-stone-900">{article.readTime}</span>
                    </motion.div>
                    <motion.h3
                      
                      className="font-serif text-xl font-extrabold leading-snug mb-3 text-gray-950 group-hover:text-red-700 transition-colors duration-300"
                    >
                      {article.title}
                    </motion.h3>
                    <motion.p
                      
                      className="text-sm text-stone-900 font-medium leading-relaxed line-clamp-2 mt-auto"
                    >
                      {article.excerpt}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer Informasi */}
      <footer id="footer-informasi" className="relative z-20 bg-white/10 backdrop-blur-sm text-gray-800 border-t border-[#860120]/20 font-sans">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Logo & Deskripsi */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000" 
                alt="Logo SP PLN" 
                className="w-16 h-20 object-contain hover:scale-105 transition-transform duration-300" 
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-serif text-lg md:text-xl font-black text-gray-950 tracking-wide leading-tight">
                  Serikat Pekerja PLN
                </h4>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 mt-0.5">
                  UID Kalimantan Barat
                </p>
              </div>
            </div>
            <p className="text-sm text-red-700 leading-relaxed max-w-2xl flex flex-col space-y-1">
              <span className="text-base font-black text-red-700 tracking-wide">SP PLN! Yes! Kuat! Bersatu!</span>
              <span className="text-base font-black text-red-700 tracking-wide">PLN! Jaya! Terbaik!</span>
              <span className="text-base font-black text-red-700 tracking-wide">Unbundling! <span className="text-red-800 font-black underline decoration-2">NO!!!</span></span>
              <span className="text-lg font-black text-red-800 tracking-wide">INDONESIA! Bangkit, Berdaulat, Merdeka, Merdeka, Merdeka!!!</span>
            </p>
          </div>

          {/* Kontak & Informasi Lokasi */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <h4 className="text-xs font-black uppercase text-red-800 font-mono tracking-widest border-b border-black/10 pb-2">
              Kontak &amp; Alamat Kantor
            </h4>
            <ul className="space-y-3.5 text-sm text-gray-800 font-semibold">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-red-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-gray-850">
                  Kantor Sekretariat SP PLN UID Kalbar, Jl. Adi Sucipto No. 23, Pontianak, Kalimantan Barat
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-red-700 shrink-0" />
                <a href="mailto:sp.pln.uidkalbar@gmail.com" className="hover:text-red-900 text-gray-900 transition-colors underline decoration-red-500/30 underline-offset-4">
                  sp.pln.uidkalbar@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-emerald-750 shrink-0" />
                <span className="font-mono text-gray-900">
                  +62 (561) 732-023
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Hak cipta bar */}
        <div className="border-t border-[#860120]/10 py-6 bg-black/5 text-gray-700 font-medium">
          <div className="max-w-7xl mx-auto px-6 text-center text-xs">
            <p className="leading-relaxed">
              &copy; {new Date().getFullYear()} Serikat Pekerja PLN Unit Induk Distribusi Kalimantan Barat. Semua Hak Dilindungi.
            </p>
          </div>
        </div>
      </footer>

      {/* Expanded Article Overlay */}
      <AnimatePresence>
        {selectedId && selectedArticle && (
          <motion.div
            key="article-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
            />
            
            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{ borderRadius: '24px' }}
            >
              <div className="overflow-y-auto flex-1 overscroll-contain">
                {/* Sticky Floating Action Buttons */}
                <div className="sticky top-0 z-50 flex justify-between items-center p-4 sm:p-6 w-full pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(null);
                    }}
                    className="p-2 sm:p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors pointer-events-auto shadow-md border border-white/5"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button className="p-2 sm:p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors pointer-events-auto shadow-md border border-white/5">
                    <Share2 size={20} />
                  </button>
                </div>

                <div className="relative h-64 sm:h-80 md:h-[50vh] w-full shrink-0 -mt-[68px] sm:-mt-[84px]">
                  <motion.img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-transparent to-black/20" />
                  
                  {/* Category Pill */}
                  <div className="absolute bottom-6 left-6 z-10">
                    <span className="px-4 py-1.5 bg-white/95 backdrop-blur text-sm font-black uppercase tracking-wider rounded-full shadow-md text-red-700 border border-stone-300">
                      {selectedArticle.category}
                    </span>
                  </div>
                </div>
                
                {/* Article Body */}
                <div className="px-6 py-8 sm:px-12 sm:py-12 md:px-16 md:py-16 bg-stone-50/90 relative z-20">
                  <motion.div className="flex items-center space-x-4 text-sm text-stone-500 mb-6 font-semibold">
                    <div className="flex items-center font-medium text-stone-900">
                      <div className="w-8 h-8 rounded-full bg-stone-200 mr-3 flex items-center justify-center text-stone-700 font-bold border border-stone-300">
                        {selectedArticle.author.charAt(0)}
                      </div>
                      {selectedArticle.author}
                    </div>
                    <span>&middot;</span>
                    <span>{selectedArticle.date}</span>
                    <span>&middot;</span>
                    <span className="flex items-center"><Clock size={16} className="mr-1 text-red-600" /> {selectedArticle.readTime}</span>
                  </motion.div>
                  
                  <motion.h1
                    className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 mb-6 leading-tight"
                  >
                    {selectedArticle.title}
                  </motion.h1>
                  
                  <motion.p
                    className="text-xl sm:text-2xl text-stone-600 font-serif italic mb-10 leading-relaxed border-l-4 border-stone-300 pl-6"
                  >
                    {selectedArticle.excerpt}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="prose prose-lg prose-stone max-w-none font-sans"
                  >
                    {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-6 text-stone-800 leading-relaxed text-lg font-normal">
                        {paragraph}
                      </p>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Gallery, Lightbox, and Profile Modals */}
      <AnimatePresence>
        {isPhotoGalleryOpen && (
          <motion.div
            key="gallery-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setIsPhotoGalleryOpen(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100/65">
                    <Camera size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif font-black text-stone-900">Galeri Foto Kegiatan</h2>
                    <p className="text-xs text-stone-500 font-sans font-medium">Serikat Pekerja PLN Unit Induk Distribusi Kalimantan Barat</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPhotoGalleryOpen(false)}
                  className="p-2 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Photo Cards Grid */}
              <div className="overflow-y-auto flex-1 p-6 md:p-8 bg-stone-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activityPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col active:scale-[0.98] transform"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-md text-[10px] font-bold text-white px-2 py-1 rounded-md">
                          {photo.date}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-stone-900 group-hover:text-red-600 transition-colors line-clamp-1 mb-1.5 font-black">
                            {photo.title}
                          </h3>
                          <p className="text-xs text-stone-500 font-mono font-semibold uppercase tracking-wider mb-2">
                            📍 {photo.location}
                          </p>
                          <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                            {photo.description}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 font-black">
                          Lihat Detail & Foto Penuh &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedPhoto && (
          <motion.div
            key="photo-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setSelectedPhoto(null)}
            />
            
            {/* Lightbox Content */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative max-w-4xl w-full bg-stone-900 border border-stone-800 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-20 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer border border-white/10"
              >
                <X size={20} />
              </button>

              <div className="relative aspect-[16/10] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 md:p-8 border-t border-stone-800 bg-stone-950/95 font-sans">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h3 className="font-serif text-2xl font-bold bg-gradient-to-r from-white via-stone-200 to-stone-400 bg-clip-text text-transparent">
                    {selectedPhoto.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    <span className="px-2.5 py-1 bg-stone-800 rounded">📅 {selectedPhoto.date}</span>
                    <span className="px-2.5 py-1 bg-stone-800 rounded text-red-400">📍 {selectedPhoto.location}</span>
                  </div>
                </div>
                <p className="text-sm md:text-base text-stone-300 leading-relaxed max-w-3xl">
                  {selectedPhoto.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isProfileOpen && (
          <motion.div
            key="profile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setIsProfileOpen(false)}
            />
                {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl max-h-[95vh] bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
              style={{ borderRadius: '24px' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    <Globe size={22} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif font-black text-stone-900">Profil Serikat Pekerja</h2>
                    <p className="text-xs text-stone-500 font-sans font-medium">SP PLN Unit Induk Distribusi Kalimantan Barat</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="p-2 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 p-6 md:p-8 bg-stone-50/50">
                <div className="prose prose-stone max-w-none font-sans text-stone-800 leading-relaxed">
                  <div className="flex justify-center mb-6">
                    <img
                      src="https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000"
                      alt="Logo SP PLN"
                      className="w-32 h-36 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Tentang Kami</h3>
                  <p className="mb-6 text-stone-700 font-medium">
                    Serikat Pekerja PT PLN (Persero) Unit Induk Distribusi Kalimantan Barat merupakan wadah kebersamaan dan perjuangan karyawan yang berasaskan Pancasila and UUD 1945. Kami berkomitmen mendukung keandalan listrik bagi seluruh rakyat Kalimantan Barat sekaligus memperjuangkan hak-hak normatif dan kesejahteraan bagi seluruh anggota.
                  </p>
 
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Visi &amp; Misi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-red-50/70 rounded-2xl border border-red-100">
                      <h4 className="font-sans font-bold text-red-800 mb-1.5">Visi</h4>
                      <p className="text-xs leading-relaxed text-stone-700">
                        Terwujudnya Serikat Pekerja yang andal, berintegritas, mandiri, profesional, serta senantiasa memperjuangkan kesejahteraan anggota guna mendukung ketenagalistrikan nasional.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100">
                      <h4 className="font-sans font-bold text-amber-800 mb-1.5">Misi</h4>
                      <ul className="text-xs list-disc pl-4 space-y-1 text-stone-700 leading-relaxed">
                        <li>Mengadvokasi hak, keselamatan, dan keharmonisan lingkungan kerja anggota.</li>
                        <li>Membina kepemimpinan &amp; integritas insan kelistrikan secara berkelanjutan.</li>
                        <li>Sinergi konstruktif dengan Manajemen dalam penyaluran tenaga listrik andal.</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Nilai Dasar</h3>
                  <p className="mb-4 text-stone-700 font-medium">
                    Melalui semangat kemitraan yang produktif, kami berkomitmen menjaga dedikasi pelayanan tanpa putus, kesetiaan penuh kawan sekerja, serta kepatuhan penuh akan keselamatan kerja demi keberlangsungan pelayanan kelistrikan bagi masyarakat luas.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

