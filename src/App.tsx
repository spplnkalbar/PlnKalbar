import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, ArrowLeft, Clock, Share2 } from 'lucide-react';
import { featuredArticle, additionalArticles, Article } from './data';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allArticles = [featuredArticle, ...additionalArticles];
  const selectedArticle = allArticles.find((a) => a.id === selectedId);

  // When an article is selected, disable background scrolling
  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedId]);

  return (
    <div className="min-h-screen font-sans text-gray-900 selection:bg-gray-900 selection:text-white relative z-0">
      {/* Base Background Environment */}
      <div className="fixed inset-0 bg-[#FDFCF8] -z-30 pointer-events-none" />

      {/* Background Backdrop Logo (More Prominent) */}
      <div className="fixed top-28 inset-x-0 bottom-0 -z-20 pointer-events-none flex items-center justify-center p-8 opacity-40">
        <img 
          src="https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w2000" 
          alt="Backdrop SP PLN" 
          className="max-h-full max-w-full w-[80vw] md:w-[50vw] lg:w-[35vw] object-contain" 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Transparent App Overlay (Glassmorphism effect over the logo) */}
      <div className="fixed inset-0 bg-[#FF0000]/20 backdrop-blur-[3px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <motion.header
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 border-b border-[#FF0000] ${
          isScrolled ? 'bg-[#FF0000]/90 backdrop-blur-md shadow-md' : 'bg-[#FF0000]/90 backdrop-blur-md'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[86px] flex items-center justify-between text-white">
          <img 
            src="https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000" 
            alt="Logo SP PLN" 
            className="w-[88px] h-[98px] object-contain" 
            referrerPolicy="no-referrer"
          />
          <div className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide drop-shadow-md text-center px-4 whitespace-nowrap truncate">Berita SP PLN Kalimantan Barat</div>
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 rounded-full hover:bg-white/20 transition-colors flex items-center"
            >
              <Menu size={24} />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 text-gray-800"
                >
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm font-medium">Kategori</button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm font-medium">Profil SP PLN Kalbar</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900">
            Edisi Hari Ini
          </h1>
          <div className="hidden md:block text-sm font-medium text-gray-500 uppercase tracking-widest">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </motion.div>

        {/* Featured Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-16">
            <motion.div
              layoutId={`card-container-${featuredArticle.id}`}
              className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/20 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-white/20 transition-all duration-500 hover:-translate-y-2"
              onClick={() => setSelectedId(featuredArticle.id)}
            >
              <div className="lg:col-span-8 overflow-hidden rounded-3xl relative aspect-[16/10] shadow-inner">
                <motion.img
                  layoutId={`image-${featuredArticle.id}`}
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none" />
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider rounded-full shadow-md text-gray-800">
                    {featuredArticle.category}
                  </span>
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col justify-center px-4 sm:px-2">
                <motion.div layoutId={`meta-${featuredArticle.id}`} className="flex items-center space-x-3 text-sm text-gray-500 mb-5 font-medium">
                  <span className="text-blue-700">{featuredArticle.author}</span>
                  <span className="text-gray-300">&bull;</span>
                  <span className="flex items-center"><Clock size={16} className="mr-1.5 opacity-70" /> {featuredArticle.readTime}</span>
                </motion.div>
                <motion.h2
                  layoutId={`title-${featuredArticle.id}`}
                  className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-5 text-gray-900 group-hover:text-blue-900 transition-colors duration-300 drop-shadow-sm"
                >
                  {featuredArticle.title}
                </motion.h2>
                <motion.p
                  layoutId={`excerpt-${featuredArticle.id}`}
                  className="text-gray-600 text-lg leading-relaxed line-clamp-3"
                >
                  {featuredArticle.excerpt}
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* Sub Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-gray-200/60 pt-16">
            {additionalArticles.map((article, index) => (
              <motion.div
                layoutId={`card-container-${article.id}`}
                key={article.id}
                className="group cursor-pointer flex flex-col bg-white/20 backdrop-blur-xl rounded-[2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-white/20 transition-all duration-500 hover:-translate-y-2 relative"
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
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none" />
                </div>
                <div className="flex flex-col flex-1 px-3 pb-3">
                  <motion.div layoutId={`meta-${article.id}`} className="flex items-center space-x-2 text-xs text-gray-500 mb-4 uppercase tracking-wider font-semibold">
                    <span className="text-blue-700">{article.category}</span>
                    <span className="text-gray-300">&bull;</span>
                    <span>{article.readTime}</span>
                  </motion.div>
                  <motion.h3
                    layoutId={`title-${article.id}`}
                    className="font-serif text-xl font-bold leading-snug mb-3 text-gray-900 group-hover:text-blue-900 transition-colors duration-300"
                  >
                    {article.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`excerpt-${article.id}`}
                    className="text-sm text-gray-600 leading-relaxed line-clamp-2 mt-auto"
                  >
                    {article.excerpt}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

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
              className="relative w-full max-w-4xl max-h-[90vh] bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
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
                    className="p-2 sm:p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors pointer-events-auto shadow-md"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button className="p-2 sm:p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors pointer-events-auto shadow-md">
                    <Share2 size={20} />
                  </button>
                </div>

                <div className="relative h-64 sm:h-80 md:h-[50vh] w-full shrink-0 -mt-[68px] sm:-mt-[84px]">
                  <motion.img
                    layoutId={`image-${selectedArticle.id}`}
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  
                  {/* Category Pill */}
                  <div className="absolute bottom-6 left-6 z-10">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur text-sm font-bold uppercase tracking-wider rounded-full shadow-sm text-gray-900">
                      {selectedArticle.category}
                    </span>
                  </div>
                </div>
                
                {/* Article Body */}
                <div className="px-6 py-8 sm:px-12 sm:py-12 md:px-16 md:py-16 bg-white/50 backdrop-blur-md relative z-20">
                  <motion.div layoutId={`meta-${selectedArticle.id}`} className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center font-medium text-gray-900">
                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-500 font-bold">
                        {selectedArticle.author.charAt(0)}
                      </div>
                      {selectedArticle.author}
                    </div>
                    <span>&middot;</span>
                    <span>{selectedArticle.date}</span>
                    <span>&middot;</span>
                    <span className="flex items-center"><Clock size={16} className="mr-1" /> {selectedArticle.readTime}</span>
                  </motion.div>
                  
                  <motion.h1
                    layoutId={`title-${selectedArticle.id}`}
                    className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
                  >
                    {selectedArticle.title}
                  </motion.h1>
                  
                  <motion.p
                    layoutId={`excerpt-${selectedArticle.id}`}
                    className="text-xl sm:text-2xl text-gray-600 font-serif italic mb-10 leading-relaxed border-l-4 border-gray-300 pl-6"
                  >
                    {selectedArticle.excerpt}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="prose prose-lg prose-gray max-w-none font-sans"
                  >
                    {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-6 text-gray-800 leading-relaxed text-lg">
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
    </div>
  );
}

