import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, ArrowLeft, Clock, Share2, Zap, Flag, Globe, Camera, X, MapPin, Mail, Phone } from 'lucide-react';
import Papa from 'papaparse';
import { plnArticles as initialPlnArticles, nasionalArticles, internasionalArticles, activityPhotos } from './data';
import type { Article, ActivityPhoto } from './data';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'pln' | 'nasional' | 'internasional'>('pln');
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ActivityPhoto | null>(null);
  
  const [plnArticles, setPlnArticles] = useState<Article[]>(initialPlnArticles);

  useEffect(() => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1-vbYnbrgysALOVHv__RdRAF5xhMjEPgMfHC1yYM8Sks/export?format=csv&gid=212834116';
    fetch(csvUrl)
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedArticles: Article[] = results.data.map((row: any, index: number) => {
              let imageUrl = row['UPLOAD FOTO DALAM BENTUK JPG'] || '';
              if (imageUrl.includes('drive.google.com/open?id=')) {
                const id = imageUrl.split('id=')[1];
                imageUrl = `https://lh3.googleusercontent.com/d/${id}=w1000`;
              } else if (imageUrl.includes('drive.google.com/file/d/')) {
                const id = imageUrl.split('/d/')[1].split('/')[0];
                imageUrl = `https://lh3.googleusercontent.com/d/${id}=w1000`;
              } else if (imageUrl.includes('drive.google.com/uc?export=view&id=')) {
                const id = imageUrl.split('id=')[1];
                imageUrl = `https://lh3.googleusercontent.com/d/${id}=w1000`;
              }

              return {
                id: `sheet-pln-${index}`,
                title: row['JUDUL BERITA'] || '',
                excerpt: row['SUB BERITA/LEAD BERITA'] || '',
                content: row['ISI BERITA'] || '',
                author: row['INFORMASI PENULIS'] || '',
                date: `${row['TANGGAL BERITA'] || ''} • ${row['WAKTU UPLOAD BERITA'] || ''}`,
                category: "SP PLN Kalimantan Barat",
                imageUrl: imageUrl,
                readTime: "3 Min Read"
              };
            });
            
            const validArticles = parsedArticles.filter(a => a.title.trim() !== '');
            if (validArticles.length > 0) {
              setPlnArticles(validArticles);
            }
          }
        });
      })
      .catch(err => console.error('Error fetching CSV data:', err));
  }, []);


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
    <div className="min-h-screen flex flex-col font-sans text-stone-900 selection:bg-red-600 selection:text-white relative z-0">
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
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b border-[#860120] flex flex-col justify-center bg-gradient-to-b ${
          isScrolled ? 'from-[#860120]/95 to-[#5a0015]/95 backdrop-blur-md shadow-md h-[72px] md:h-[88px]' : 'from-[#860120]/90 to-[#5a0015]/90 backdrop-blur-md h-[88px] md:h-[110px]'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-white select-none w-full">
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
              className={`object-contain hover:scale-105 transition-all duration-300 ${isScrolled ? 'w-[50px] h-[58px] md:w-[70px] md:h-[78px]' : 'w-[60px] h-[68px] md:w-[88px] md:h-[98px]'}`} 
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
            className="font-serif text-lg sm:text-2xl lg:text-3.5xl font-bold tracking-wide drop-shadow-md text-center px-2 sm:px-4 cursor-pointer hover:opacity-90 transition-opacity flex-1"
          >
            Berita SP PLN Kalimantan Barat
          </div>
          <div className={`shrink-0 transition-all duration-300 ${isScrolled ? 'w-[50px] md:w-[70px]' : 'w-[60px] md:w-[88px]'}`} /> {/* Spacer for centering */}
        </div>
      </motion.header>

      {/* Sub Navigation */}
      <motion.div 
        className={`fixed inset-x-0 z-30 transition-all duration-300 bg-white/50 backdrop-blur-md shadow-sm border-b border-stone-200/50 py-3 ${
          isScrolled ? 'top-[72px] md:top-[88px]' : 'top-[88px] md:top-[110px]'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <button 
            onClick={() => {
              setSelectedId(null);
              setIsProfileOpen(false);
              setIsPhotoGalleryOpen(false);
            }}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer ${
              !isProfileOpen && !isPhotoGalleryOpen && !selectedId
                ? 'bg-red-700 text-white shadow-md' 
                : 'bg-white/70 text-stone-700 hover:bg-white/90'
            }`}
          >
            Edisi Hari Ini
          </button>
          <button 
            onClick={() => {
              setIsProfileOpen(true);
              setIsPhotoGalleryOpen(false);
              setSelectedId(null);
            }}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer ${
              isProfileOpen 
                ? 'bg-red-700 text-white shadow-md' 
                : 'bg-white/70 text-stone-700 hover:bg-white/90'
            }`}
          >
            Profil SP PLN Kalbar
          </button>
          <button 
            onClick={() => {
              setIsPhotoGalleryOpen(true);
              setIsProfileOpen(false);
              setSelectedId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer ${
              isPhotoGalleryOpen 
                ? 'bg-red-700 text-white shadow-md' 
                : 'bg-white/70 text-stone-700 hover:bg-white/90'
            }`}
          >
            <Camera size={14} className={isPhotoGalleryOpen ? "text-white" : "text-stone-500"} />
            <span>Foto Kegiatan</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 pt-44 md:pt-48 pb-20 px-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {isPhotoGalleryOpen ? (
            <motion.div
              key="photo-gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="mb-6 flex items-center justify-between border-b border-stone-300/70 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 shadow-sm">
                    <Camera size={28} className="animate-pulse" />
                  </div>
                  <div>
                    <h1 className="font-serif text-3xl md:text-5xl font-black text-stone-900 leading-tight">
                      Galeri Foto Kegiatan
                    </h1>
                    <p className="text-sm text-stone-500 font-sans font-medium uppercase tracking-wider mt-1">
                      SP PLN UID Kalimantan Barat
                    </p>
                  </div>
                </div>
              </div>

              {activityPhotos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
                  {activityPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group bg-white/75 backdrop-blur-md rounded-3xl overflow-hidden border border-stone-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(134,1,32,0.12)] transition-all duration-500 cursor-pointer flex flex-col active:scale-[0.98] transform hover:-translate-y-2"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 shadow-inner">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md text-xs font-bold text-white px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                          {photo.date}
                        </span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif text-xl font-extrabold leading-snug mb-2 text-gray-950 group-hover:text-red-700 transition-colors duration-300">
                            {photo.title}
                          </h3>
                          <p className="text-xs text-red-700 font-bold uppercase tracking-wider mb-3">
                            📍 {photo.location}
                          </p>
                          <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed mb-4 font-medium">
                            {photo.description}
                          </p>
                        </div>
                        <span className="text-xs font-black text-red-700 hover:text-red-800 inline-flex items-center gap-1.5 uppercase tracking-wide">
                          Lihat Detail Foto &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 bg-white/50 backdrop-blur-md rounded-[2rem] border border-stone-200/50 border-dashed text-center mt-8">
                  <div className="w-20 h-20 mb-6 bg-white border border-stone-200/80 rounded-full flex items-center justify-center text-stone-400 shadow-sm">
                    <Camera size={36} />
                  </div>
                  <h3 className="font-serif text-3xl font-black text-stone-800 mb-3">Belum Ada Foto</h3>
                  <p className="text-stone-500 max-w-md text-lg leading-relaxed">
                    Saat ini belum ada dokumentasi kegiatan yang diunggah. Silakan kembali lagi nanti.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="news-feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="mb-6 flex items-center justify-between border-b border-stone-300/70 pb-4">
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
              </div>

              {/* Tab Pages / Categories Selector */}
              <div
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
              </div>

              {/* Featured Article & Sub Articles Section with dynamic key for smooth transitions */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {featuredArticle ? (
                  <div className="mb-16">
                    <motion.div
                      layoutId={`card-container-${featuredArticle.id}`}
                      className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/75 backdrop-blur-md rounded-[2rem] p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(134,1,32,0.12)] border border-stone-200/50 transition-all duration-500 hover:-translate-y-2"
                      onClick={() => setSelectedId(featuredArticle.id)}
                    >
                      <div className="lg:col-span-8 overflow-hidden rounded-3xl relative aspect-[16/10] shadow-inner font-sans">
                        <motion.img
                          layoutId={`image-${featuredArticle.id}`}
                          src={featuredArticle.imageUrl}
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl pointer-events-none" />
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-4 py-2 bg-black/85 backdrop-blur-md text-xs font-bold uppercase tracking-wider rounded-full shadow-md text-stone-100 border border-white/10">
                            {featuredArticle.category}
                          </span>
                        </div>
                      </div>
                      <div className="lg:col-span-4 flex flex-col justify-center px-4 sm:px-2 font-sans">
                        <motion.div layoutId={`meta-${featuredArticle.id}`} className="flex items-center space-x-3 text-sm text-stone-800 mb-5 font-semibold">
                          <span className="text-red-700 font-extrabold">{featuredArticle.author}</span>
                          <span className="text-stone-400">&bull;</span>
                          <span className="flex items-center text-stone-900"><Clock size={16} className="mr-1.5 opacity-80" /> {featuredArticle.readTime}</span>
                        </motion.div>
                        <motion.h2
                          layoutId={`title-${featuredArticle.id}`}
                          className="font-serif text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-5 text-gray-950 group-hover:text-red-700 transition-colors duration-300 drop-shadow-sm"
                        >
                          {featuredArticle.title}
                        </motion.h2>
                        <motion.p
                          layoutId={`excerpt-${featuredArticle.id}`}
                          className="text-stone-900 text-lg font-medium leading-relaxed line-clamp-3"
                        >
                          {featuredArticle.excerpt}
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-stone-200 border-dashed text-center">
                    <div className="w-16 h-16 mb-4 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                      <Menu size={32} />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-stone-800 mb-2">Belum Ada Berita</h3>
                    <p className="text-stone-500 max-w-md">Saat ini belum ada artikel yang dipublikasikan pada kategori ini. Silakan kembali lagi nanti.</p>
                  </div>
                )}

                {/* Sub Articles Grid */}
                {additionalArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-stone-300 pt-16">
                    {additionalArticles.map((article, index) => (
                      <motion.div
                        layoutId={`card-container-${article.id}`}
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
                            layoutId={`image-${article.id}`}
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl pointer-events-none" />
                        </div>
                        <div className="flex flex-col flex-1 px-3 pb-3">
                          <motion.div layoutId={`meta-${article.id}`} className="flex items-center space-x-2 text-xs text-stone-800 mb-4 uppercase tracking-wider font-bold">
                            <span className="text-red-700">{article.category}</span>
                            <span className="text-stone-400">&bull;</span>
                            <span className="text-stone-900">{article.readTime}</span>
                          </motion.div>
                          <motion.h3
                            layoutId={`title-${article.id}`}
                            className="font-serif text-xl font-extrabold leading-snug mb-3 text-gray-950 group-hover:text-red-700 transition-colors duration-300"
                          >
                            {article.title}
                          </motion.h3>
                          <motion.p
                            layoutId={`excerpt-${article.id}`}
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Informasi */}
      <footer id="footer-informasi" className="mt-auto shrink-0 relative z-20 bg-white/10 backdrop-blur-sm text-gray-800 border-t border-[#860120]/20 font-sans">
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
                  Jl. Gusti Sulung Lelanang No.14, Benua Melayu Darat, Kec. Pontianak Sel., Kota Pontianak, Kalimantan Barat 78243
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-red-700 shrink-0" />
                <span className="text-gray-900">
                  dpdspplnkalbar@gmail.com
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-emerald-700 shrink-0" />
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
              &copy; {new Date().getFullYear()} Serikat Pekerja PLN Unit Induk Distribusi Kalimantan Barat. Dikelola Tim Humas.
            </p>
          </div>
        </div>
      </footer>

      {/* Expanded Article Overlay */}
      <AnimatePresence>
        {selectedId && selectedArticle && (
          <motion.div
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
              layoutId={`card-container-${selectedArticle.id}`}
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
                    layoutId={`image-${selectedArticle.id}`}
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover absolute inset-0"
                    referrerPolicy="no-referrer"
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
                  <motion.div layoutId={`meta-${selectedArticle.id}`} className="flex items-center space-x-4 text-sm text-stone-500 mb-6 font-semibold">
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
                    layoutId={`title-${selectedArticle.id}`}
                    className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 mb-6 leading-tight"
                  >
                    {selectedArticle.title}
                  </motion.h1>
                  
                  <motion.p
                    layoutId={`excerpt-${selectedArticle.id}`}
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

      {/* Lightbox, and Profile Modals */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
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
                      className="object-contain"
                      style={{ height: '250px', width: '200px' }}
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
                      <div className="text-xs leading-relaxed text-stone-700 space-y-2">
                        <p>Menjaga kesinambungan PT PLN (Persero) agar tetap tumbuh dan berkembang sebagai Pengemban Amanah Konstitusi dibidang Ketenagalistrikan yang terintegrasi dari Pembangkitan, transmisi, distribusi dan penjualan;</p>
                        <p>Meningkatkan Kesejahteraan Insan PLN dan mengawal pembinaan Sistim Karir pegawai yang berkeadilan dan berkesinambungan sesuai dengan kompetensinya agar PLN sebagai pengemban Amanah Konstitusi dibidang ketenagalistrikan dikelola dengan baik dan benar sesuai prinsip Good Coorporate Governance (GCG);</p>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100">
                      <h4 className="font-sans font-bold text-amber-800 mb-1.5">Misi</h4>
                      <p className="text-xs leading-relaxed text-stone-700">&nbsp;</p>
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

