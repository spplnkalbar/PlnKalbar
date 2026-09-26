import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, ArrowLeft, Clock, Share2, Camera, X, MapPin, Mail, Phone,
  ZoomIn, ChevronLeft, ChevronRight, Download, Maximize2, Check, ExternalLink, Sparkles,
  Shield, ShieldCheck
} from 'lucide-react';
import { plnArticles as initialPlnArticles, nasionalArticles as initialNasionalArticles, activityPhotos as initialActivityPhotos } from './data';
import type { Article, ActivityPhoto } from './data';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { apiService } from './services/api';
import { authService, AuthUser } from './services/auth';

// Helper to convert any Google Drive URL format into direct high-resolution image stream
function formatDriveImageUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // 1. Google Drive file URL format: /file/d/FILE_ID/...
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}=w1600`;
  }

  // 2. Google Drive parameter URL: ?id=FILE_ID or &id=FILE_ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}=w1600`;
  }

  // 3. lh3 direct URL: lh3.googleusercontent.com/d/FILE_ID
  const lh3Match = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  if (lh3Match && lh3Match[1]) {
    return `https://lh3.googleusercontent.com/d/${lh3Match[1]}=w1600`;
  }

  // 4. Raw Google Drive file ID
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return `https://lh3.googleusercontent.com/d/${trimmed}=w1600`;
  }

  return trimmed;
}

// Helper to find column values flexibly even if headers change slightly
function getRowField(row: Record<string, any>, keywords: string[]): string {
  if (!row || typeof row !== 'object') return '';
  const keys = Object.keys(row);
  for (const kw of keywords) {
    const key = keys.find(k => k.trim().toLowerCase() === kw.toLowerCase());
    if (key && row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
  }
  for (const kw of keywords) {
    const key = keys.find(k => k.toLowerCase().includes(kw.toLowerCase()));
    if (key && row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
  }
  return '';
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'pln' | 'nasional'>('pln');
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ActivityPhoto | null>(null);
  
  // Administrator authentication state (sesi aman berbasis token backend)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Status koneksi REST API Termux / SQLite backend
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);

  // Sumber data artikel dan foto aktif (dari SQLite REST API)
  const [plnArticles, setPlnArticles] = useState<Article[]>(initialPlnArticles);
  const [nasionalArticles, setNasionalArticles] = useState<Article[]>(initialNasionalArticles);
  const [photos, setPhotos] = useState<ActivityPhoto[]>(initialActivityPhotos);

  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Verifikasi sesi token administrator saat inisialisasi aplikasi
  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService.getMe()
        .then((user) => {
          setIsAuthenticated(true);
          setAdminUser(user);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setAdminUser(null);
          setIsAdminPanelOpen(false);
        });
    } else {
      setIsAuthenticated(false);
      setAdminUser(null);
      setIsAdminPanelOpen(false);
    }

    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setAdminUser(null);
      setIsAdminPanelOpen(false);
      setIsLoginModalOpen(true);
      showToast('Sesi administrator telah berakhir. Silakan login kembali.');
    };

    const handleLoggedOut = () => {
      setIsAuthenticated(false);
      setAdminUser(null);
      setIsAdminPanelOpen(false);
      setIsLoginModalOpen(true);
      showToast('Logout berhasil. Sesi administrator telah diakhiri.');
    };

    window.addEventListener('sp_pln_auth_expired', handleAuthExpired);
    window.addEventListener('sp_pln_logged_out', handleLoggedOut);
    return () => {
      window.removeEventListener('sp_pln_auth_expired', handleAuthExpired);
      window.removeEventListener('sp_pln_logged_out', handleLoggedOut);
    };
  }, [showToast]);

  const handleAuthErrorFallback = useCallback((err: any) => {
    if (
      err?.message?.includes('Akses ditolak') || 
      err?.message?.includes('Sesi administrator') || 
      err?.message?.includes('401')
    ) {
      setIsAuthenticated(false);
      setAdminUser(null);
      setIsLoginModalOpen(true);
      showToast('Sesi administrator telah kedaluwarsa. Silakan login kembali.');
    }
  }, [showToast]);

  // Admin mutation handlers berkomunikasi langsung dengan REST API SQLite di Termux Android
  const handleAddPlnArticle = async (articleData: Omit<Article, 'id'>) => {
    try {
      const created = await apiService.createArticle({
        ...articleData,
        type: 'pln'
      });
      setPlnArticles((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      setIsApiConnected(true);
      showToast('Berita SP PLN Kalbar berhasil disimpan ke SQLite!');
    } catch (err: any) {
      handleAuthErrorFallback(err);
      showToast(`Gagal menyimpan berita: ${err?.message || 'Server error'}`);
    }
  };

  const handleAddNasionalArticle = async (articleData: Omit<Article, 'id'>) => {
    try {
      const created = await apiService.createArticle({
        ...articleData,
        type: 'nasional'
      });
      setNasionalArticles((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      setIsApiConnected(true);
      showToast('Berita Nasional berhasil disimpan ke SQLite!');
    } catch (err: any) {
      handleAuthErrorFallback(err);
      showToast(`Gagal menyimpan berita nasional: ${err?.message || 'Server error'}`);
    }
  };

  const handleAddPhoto = async (photoData: Omit<ActivityPhoto, 'id'>) => {
    try {
      const created = await apiService.createPhoto(photoData);
      setPhotos((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      setIsApiConnected(true);
      showToast('Foto kegiatan berhasil disimpan ke SQLite!');
    } catch (err: any) {
      handleAuthErrorFallback(err);
      showToast(`Gagal menyimpan foto: ${err?.message || 'Server error'}`);
    }
  };

  const handleDeletePlnArticle = async (id: string) => {
    try {
      await apiService.deleteArticle(id);
      setPlnArticles((prev) => prev.filter((a) => a.id !== id));
      showToast('Berita berhasil dihapus dari SQLite!');
    } catch (err: any) {
      handleAuthErrorFallback(err);
      showToast(`Gagal menghapus berita: ${err?.message || 'Server error'}`);
    }
  };

  const handleDeleteNasionalArticle = async (id: string) => {
    try {
      await apiService.deleteArticle(id);
      setNasionalArticles((prev) => prev.filter((a) => a.id !== id));
      showToast('Berita nasional berhasil dihapus dari SQLite!');
    } catch (err: any) {
      handleAuthErrorFallback(err);
      showToast(`Gagal menghapus berita: ${err?.message || 'Server error'}`);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await apiService.deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      showToast('Foto kegiatan berhasil dihapus dari SQLite!');
    } catch (err: any) {
      handleAuthErrorFallback(err);
      showToast(`Gagal menghapus foto: ${err?.message || 'Server error'}`);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setAdminUser(null);
    setIsAdminPanelOpen(false);
    showToast('Berhasil logout dari mode administrator');
  };

  const handleUpdatePlnArticle = async (id: string, updatedData: Partial<Article>) => {
    try {
      const updated = await apiService.updateArticle(id, updatedData as any);
      setPlnArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast('Berita SP PLN Kalbar berhasil diperbarui!');
    } catch (err: any) {
      handleAuthErrorFallback(err);
      showToast(`Gagal memperbarui berita: ${err?.message || 'Server error'}`);
    }
  };

  const handleUpdateNasionalArticle = async (id: string, updatedData: Partial<Article>) => {
    try {
      const updated = await apiService.updateArticle(id, updatedData as any);
      setNasionalArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast('Berita Nasional berhasil diperbarui!');
    } catch (err: any) {
      handleAuthErrorFallback(err);
      showToast(`Gagal memperbarui berita: ${err?.message || 'Server error'}`);
    }
  };

  const handleUpdatePhoto = async (id: string, updatedData: Partial<ActivityPhoto>) => {
    try {
      const updated = await apiService.updatePhoto(id, updatedData as any);
      setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Foto kegiatan berhasil diperbarui!');
    } catch (err: any) {
      handleAuthErrorFallback(err);
      showToast(`Gagal memperbarui foto: ${err?.message || 'Server error'}`);
    }
  };

  const customPlnIds = useMemo(() => new Set(plnArticles.map(a => a.id)), [plnArticles]);
  const customNasionalIds = useMemo(() => new Set(nasionalArticles.map(a => a.id)), [nasionalArticles]);
  const customPhotoIds = useMemo(() => new Set(photos.map(p => p.id)), [photos]);

  // Pengambilan data dari REST API (Express + SQLite di Termux Android)
  const loadData = useCallback(async () => {
    setIsLoadingNews(true);
    try {
      const [fetchedPln, fetchedNasional, fetchedPhotos] = await Promise.all([
        apiService.getArticles('pln').catch(() => null),
        apiService.getArticles('nasional').catch(() => null),
        apiService.getPhotos().catch(() => null),
      ]);

      if (fetchedPln !== null && fetchedNasional !== null && fetchedPhotos !== null) {
        setIsApiConnected(true);
        if (fetchedPln.length > 0) setPlnArticles(fetchedPln);
        if (fetchedNasional.length > 0) setNasionalArticles(fetchedNasional);
        if (fetchedPhotos.length > 0) setPhotos(fetchedPhotos);
      } else {
        const healthy = await apiService.checkHealth();
        setIsApiConnected(healthy);
        if (fetchedPln) setPlnArticles(fetchedPln);
        if (fetchedNasional) setNasionalArticles(fetchedNasional);
        if (fetchedPhotos) setPhotos(fetchedPhotos);
      }
    } catch {
      setIsApiConnected(false);
    } finally {
      setIsLoadingNews(false);
    }
  }, []);

  const [settings, setSettings] = useState<Record<string, string>>({
    profile_title: "Profil Serikat Pekerja",
    profile_subtitle: "SP PLN Unit Induk Distribusi Kalimantan Barat",
    profile_about: "Serikat Pekerja PT PLN (Persero) Unit Induk Distribusi Kalimantan Barat merupakan wadah kebersamaan dan perjuangan karyawan yang berasaskan Pancasila and UUD 1945. Kami berkomitmen mendukung keandalan listrik bagi seluruh rakyat Kalimantan Barat sekaligus memperjuangkan hak-hak normatif dan kesejahteraan bagi seluruh anggota.",
    profile_visi: "Menjaga kesinambungan PT PLN (Persero) agar tetap tumbuh dan berkembang sebagai Pengemban Amanah Konstitusi dibidang Ketenagalistrikan yang terintegrasi dari Pembangkitan, transmisi, distribusi dan penjualan;\nMeningkatkan Kesejahteraan Insan PLN dan mengawal pembinaan Sistim Karir pegawai yang berkeadilan dan berkesinambungan sesuai dengan kompetensinya agar PLN sebagai pengemban Amanah Konstitusi dibidang ketenagalistrikan dikelola dengan baik dan benar sesuai prinsip Good Coorporate Governance (GCG);",
    profile_misi: "",
    profile_nilai: "Melalui semangat kemitraan yang produktif, kami berkomitmen menjaga dedikasi pelayanan tanpa putus, kesetiaan penuh kawan sekerja, serta kepatuhan penuh akan keselamatan kerja demi keberlangsungan pelayanan kelistrikan bagi masyarakat luas.",
    footer_slogan_1: "SP PLN! Yes! Kuat! Bersatu!",
    footer_slogan_2: "PLN! Jaya! Terbaik!",
    footer_slogan_3: "Unbundling! NO!!!",
    footer_slogan_4: "INDONESIA! Bangkit, Berdaulat, Merdeka, Merdeka, Merdeka!!!",
    footer_address: "Jl. Gusti Sulung Lelanang No.14, Benua Melayu Darat, Kec. Pontianak Sel., Kota Pontianak, Kalimantan Barat 78243",
    footer_email: "dpdspplnkalbar@gmail.com",
    footer_phone: "+62 (561) 732-023"
  });

  const loadSettings = useCallback(async () => {
    try {
      const fetched = await apiService.getSettings();
      if (fetched && Object.keys(fetched).length > 0) {
        setSettings(prev => ({ ...prev, ...fetched }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleUpdateSettings = async (newSettings: Record<string, string>) => {
    await apiService.updateSettings(newSettings);
    setSettings(newSettings);
    showToast('Pengaturan berhasil diperbarui!');
  };

  useEffect(() => {
    loadData();
    // Sinkronisasi otomatis setiap 25 detik
    const interval = setInterval(loadData, 25000);
    return () => clearInterval(interval);
  }, [loadData]);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentPhotoIndex = selectedPhoto ? photos.findIndex(p => p.id === selectedPhoto.id) : -1;

  const handlePrevPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (photos.length === 0) return;
    const prevIdx = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : photos.length - 1;
    setSelectedPhoto(photos[prevIdx]);
  }, [currentPhotoIndex, photos]);

  const handleNextPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (photos.length === 0) return;
    const nextIdx = currentPhotoIndex < photos.length - 1 ? currentPhotoIndex + 1 : 0;
    setSelectedPhoto(photos[nextIdx]);
  }, [currentPhotoIndex, photos]);

  const copyTextToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fallback
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  };

  const handleCloseArticle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedId(null);
    if (window.location.hash.startsWith('#article-')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleShareArticle = async (article: Article, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const shareUrl = `${origin}${pathname}#article-${article.id}`;
    const shareTitle = article.title;
    const shareText = `${article.title} - Warta SP PLN UID Kalimantan Barat`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          return;
        }
      }
    }

    const copied = await copyTextToClipboard(`${shareTitle}\n\n${shareUrl}`);
    if (copied) {
      showToast('Tautan berita berhasil disalin ke papan klip!');
    } else {
      showToast('Gagal menyalin tautan berita.');
    }
  };

  const handleSharePhoto = async (photo: ActivityPhoto, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title,
          text: photo.description,
          url: photo.imageUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          return;
        }
      }
    }

    const copied = await copyTextToClipboard(photo.imageUrl);
    if (copied) {
      showToast('Tautan foto berhasil disalin ke papan klip!');
    } else {
      showToast('Gagal menyalin tautan foto.');
    }
  };

  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, handlePrevPhoto, handleNextPhoto]);

  const currentArticles = activeTab === 'pln' 
    ? plnArticles 
    : nasionalArticles;

  const featuredArticle = currentArticles[0];
  const additionalArticles = currentArticles.slice(1);

  const allArticles = [...plnArticles, ...nasionalArticles];
  const selectedArticle = allArticles.find((a) => a.id === selectedId);

  // Support deep-linking via #article-{id}
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#article-')) {
        const id = hash.replace('#article-', '');
        setSelectedId(id);
        if (nasionalArticles.some((a) => a.id === id)) {
          setActiveTab('nasional');
        } else if (plnArticles.some((a) => a.id === id)) {
          setActiveTab('pln');
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [plnArticles, nasionalArticles]);

  // When an article/profile/photo lightbox modal is selected, disable background scrolling
  useEffect(() => {
    if (selectedId || isProfileOpen || selectedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedId, isProfileOpen, selectedPhoto]);

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
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 border-none flex flex-col justify-center ${
          isScrolled ? 'h-[76px] md:h-[88px]' : 'h-[92px] md:h-[110px]'
        }`}
        style={{
          background: 'linear-gradient(180deg, #860120 0%, #860120 68%, #ffffff 100%)',
          border: 'none',
          boxShadow: 'none',
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-white select-none w-full relative z-10">
          <div 
            onClick={() => {
              setSelectedId(null);
              setIsPhotoGalleryOpen(false);
              setIsProfileOpen(false);
              setSelectedPhoto(null);
              setIsAdminPanelOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000" 
              alt="Logo SP PLN" 
              className="object-contain hover:scale-105 transition-all duration-300 drop-shadow-sm h-[52px] w-[50px] sm:h-[64px] sm:w-[61px] md:h-[74px] md:w-[71px] mb-3 sm:mb-5 md:mb-[27px]" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div 
            onClick={() => {
              setSelectedId(null);
              setIsPhotoGalleryOpen(false);
              setIsProfileOpen(false);
              setSelectedPhoto(null);
              setIsAdminPanelOpen(false);
            }}
            className="font-serif font-bold tracking-tight sm:tracking-normal md:tracking-wide drop-shadow-md text-center cursor-pointer hover:opacity-90 transition-all flex-1 leading-tight sm:leading-snug text-base sm:text-2xl md:text-3xl lg:text-[34px] px-2 sm:px-4 pb-3 sm:pb-5 md:pb-[29px]"
          >
            Berita SP PLN Kalimantan Barat
          </div>
          <div className="shrink-0 transition-all duration-300 w-[50px] sm:w-[61px] md:w-[71px] flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                if (!authService.isAuthenticated()) {
                  setIsAuthenticated(false);
                  setAdminUser(null);
                  setIsAdminPanelOpen(false);
                  setIsLoginModalOpen(true);
                } else {
                  authService.getMe()
                    .then((user) => {
                      setIsAuthenticated(true);
                      setAdminUser(user);
                      setIsAdminPanelOpen(prev => !prev);
                      setIsProfileOpen(false);
                      setIsPhotoGalleryOpen(false);
                      setSelectedId(null);
                    })
                    .catch(() => {
                      setIsAuthenticated(false);
                      setAdminUser(null);
                      setIsAdminPanelOpen(false);
                      setIsLoginModalOpen(true);
                      showToast('Sesi administrator telah berakhir. Silakan login kembali.');
                    });
                }
              }}
              title={isAuthenticated ? (isAdminPanelOpen ? "Tutup Panel Admin" : "Buka Panel Administrator") : "Login Administrator"}
              className={`p-1.5 sm:p-2 md:p-2.5 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center relative mb-3 sm:mb-5 md:mb-[27px] ${
                isAuthenticated 
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/40 ring-2 ring-white/70 hover:scale-105 active:scale-95' 
                  : 'bg-white/15 hover:bg-white/25 text-white/90 hover:text-white backdrop-blur-sm border border-white/20 hover:scale-105 active:scale-95'
              }`}
              aria-label="Ikon Masuk Admin"
            >
              {isAuthenticated ? (
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-stone-950" />
              ) : (
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Sub Navigation */}
      <motion.div 
        className={`fixed inset-x-0 z-30 transition-all duration-300 py-3 bg-white border-none shadow-none ${
          isScrolled ? 'top-[76px] md:top-[88px]' : 'top-[92px] md:top-[110px]'
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
              setIsAdminPanelOpen(false);
            }}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-xs ${
              !isProfileOpen && !isPhotoGalleryOpen && !isAdminPanelOpen && !selectedId
                ? 'bg-red-700 text-white shadow-md' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80'
            }`}
          >
            Edisi Hari Ini
          </button>
          <button 
            onClick={() => {
              setIsProfileOpen(true);
              setIsPhotoGalleryOpen(false);
              setIsAdminPanelOpen(false);
              setSelectedId(null);
            }}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-xs ${
              isProfileOpen 
                ? 'bg-red-700 text-white shadow-md' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80'
            }`}
          >
            Profil SP PLN Kalbar
          </button>
          <button 
            onClick={() => {
              setIsPhotoGalleryOpen(true);
              setIsProfileOpen(false);
              setIsAdminPanelOpen(false);
              setSelectedId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-xs ${
              isPhotoGalleryOpen 
                ? 'bg-red-700 text-white shadow-md' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80'
            }`}
          >
            <Camera size={14} className={isPhotoGalleryOpen ? "text-white" : "text-stone-500"} />
            <span>Foto Kegiatan</span>
          </button>
          
          {/* Menu Panel Administrator - hanya muncul setelah login administrator berhasil */}
          {isAuthenticated && (
            <button 
              onClick={() => {
                setIsAdminPanelOpen(true);
                setIsPhotoGalleryOpen(false);
                setIsProfileOpen(false);
                setSelectedId(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-xs ${
                isAdminPanelOpen 
                  ? 'bg-red-700 text-white shadow-md' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              <ShieldCheck size={14} className={isAdminPanelOpen ? "text-white" : "text-amber-700"} />
              <span>Panel Administrator</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 pt-44 md:pt-48 pb-20 px-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {isAdminPanelOpen && isAuthenticated ? (
            <motion.div
              key="admin-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <AdminPanel
                onAddPlnArticle={handleAddPlnArticle}
                onAddNasionalArticle={handleAddNasionalArticle}
                onAddPhoto={handleAddPhoto}
                onUpdatePlnArticle={handleUpdatePlnArticle}
                onUpdateNasionalArticle={handleUpdateNasionalArticle}
                onUpdatePhoto={handleUpdatePhoto}
                onDeletePlnArticle={handleDeletePlnArticle}
                onDeleteNasionalArticle={handleDeleteNasionalArticle}
                onDeletePhoto={handleDeletePhoto}
                plnArticles={plnArticles}
                nasionalArticles={nasionalArticles}
                photos={photos}
                customPlnIds={customPlnIds}
                customNasionalIds={customNasionalIds}
                customPhotoIds={customPhotoIds}
                isApiConnected={isApiConnected}
                adminUsername={adminUser?.username || 'admin'}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onClose={() => setIsAdminPanelOpen(false)}
                onExitAdminMode={handleLogout}
                onViewArticle={(id) => {
                  setIsAdminPanelOpen(false);
                  setSelectedId(id);
                }}
                onViewPhoto={(photo) => {
                  setIsAdminPanelOpen(false);
                  setIsPhotoGalleryOpen(true);
                  setSelectedPhoto(photo);
                }}
                showToast={showToast}
              />
            </motion.div>
          ) : isPhotoGalleryOpen ? (
            <motion.div
              key="photo-gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Back to news button & Navigation Crumb */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <button
                  onClick={() => setIsPhotoGalleryOpen(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/85 hover:bg-white text-stone-700 hover:text-red-700 text-sm font-semibold border border-stone-200/80 shadow-2xs transition-all duration-200 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Kembali ke Edisi Berita</span>
                </button>
              </div>

              {/* Header Title Section */}
              <div className="mb-8 pb-6 border-b border-stone-200/80">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-3xl md:text-5xl font-black text-stone-900 leading-tight">
                      Dokumentasi & Foto Kegiatan
                    </h1>
                  </div>
                </div>
              </div>

              {/* Spotlight Featured Photo (Hero Banner) */}
              {photos.length > 0 && (
                <div className="mb-12">
                  <div
                    onClick={() => setSelectedPhoto(photos[0])}
                    className="relative group cursor-pointer overflow-hidden rounded-3xl border border-stone-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_24px_50px_rgba(134,1,32,0.16)] transition-all duration-500 bg-stone-900"
                  >
                    <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
                      <img
                        src={photos[0].imageUrl}
                        alt={photos[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M')) {
                            target.src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent" />
                      
                      {/* Spotlight Floating Content */}
                      <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 flex flex-col justify-end">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5">
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-700 text-white font-sans text-xs shadow-sm">
                            <Sparkles size={13} />
                            Dokumentasi Terkini
                          </span>
                          <span className="text-white/80 font-sans hidden sm:inline">
                            {photos[0].date} &middot; {photos[0].location}
                          </span>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3 drop-shadow-md group-hover:text-red-300 transition-colors duration-300">
                          {photos[0].title}
                        </h2>
                        <p className="text-sm md:text-base text-stone-200 line-clamp-2 md:line-clamp-3 max-w-4xl font-sans leading-relaxed drop-shadow-sm mb-5">
                          {photos[0].description}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/30 transition-all shadow-sm">
                            <ZoomIn size={16} />
                            Lihat Foto Resolusi Penuh & Keterangan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Showcase Content */}
              {photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group bg-white rounded-[2rem] p-5 border border-stone-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.07)] hover:shadow-[0_24px_50px_rgba(134,1,32,0.15)] ring-1 ring-stone-900/5 hover:border-red-300 transition-all duration-300 cursor-pointer flex flex-col active:scale-[0.99] transform hover:-translate-y-2 relative"
                    >
                      {/* Image Frame with Inner Inset & Rounded Border */}
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-stone-100 border border-stone-100 shadow-inner mb-5">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M')) {
                              target.src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/15 to-transparent opacity-65 group-hover:opacity-85 transition-opacity duration-300" />
                        
                        {/* Photo Number Tag */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[11px] font-bold text-white rounded-lg border border-white/15">
                            Dokumentasi #{index + 1}
                          </span>
                        </div>

                        {/* Top Right Actions: Quick Share & Zoom Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          <button
                            type="button"
                            onClick={(e) => handleSharePhoto(photo, e)}
                            className="p-2 bg-black/60 hover:bg-red-700 text-white rounded-xl backdrop-blur-md border border-white/20 shadow-md transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                            title="Bagikan foto kegiatan ini"
                            aria-label="Bagikan foto"
                          >
                            <Share2 size={13} />
                          </button>
                          <span className="p-2 bg-white/90 text-stone-900 rounded-xl shadow-md hidden group-hover:flex items-center justify-center transition-all">
                            <ZoomIn size={14} />
                          </span>
                        </div>

                        {/* Inset Metadata on Bottom of Image */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-stone-200 font-sans">
                          <span className="truncate flex items-center gap-1">📍 {photo.location}</span>
                          <span className="shrink-0 font-medium">{photo.date}</span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200/60 px-2.5 py-0.5 rounded-full">
                              SP PLN UID Kalbar
                            </span>
                            <span className="text-xs text-stone-400 font-medium font-sans">
                              {photo.date}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg md:text-xl font-bold leading-snug mb-3 text-stone-900 group-hover:text-red-700 transition-colors duration-300">
                            {photo.title}
                          </h3>
                          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-1.5">
                            Keterangan:
                          </p>
                          <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed font-sans font-normal mb-5">
                            {photo.description}
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-auto">
                          <button
                            type="button"
                            onClick={(e) => handleSharePhoto(photo, e)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            <Share2 size={13} />
                            <span>Bagikan</span>
                          </button>
                          <span className="text-xs font-bold text-red-700 group-hover:text-red-800 inline-flex items-center gap-1">
                            Buka Foto & Detail &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-24 bg-white/70 backdrop-blur-md rounded-3xl border border-stone-200/90 shadow-sm border-dashed text-center mt-6 px-6">
                  <div className="w-16 h-16 mb-4 bg-red-50 text-red-700 border border-red-200/80 rounded-2xl flex items-center justify-center shadow-xs">
                    <Camera size={30} />
                  </div>
                  <h3 className="font-serif text-2xl font-black text-stone-900 mb-2">
                    Belum Ada Dokumentasi Kegiatan
                  </h3>
                  <p className="text-stone-600 max-w-lg text-sm leading-relaxed mb-4">
                    Belum ada dokumentasi foto kegiatan yang tersimpan di database SQLite server SP PLN Kalbar.
                  </p>
                  <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                    isApiConnected 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    {isApiConnected ? 'Server Terhubung' : 'Server Tidak Terhubung'}
                  </span>
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
                <div className="text-sm font-medium text-stone-500 uppercase tracking-widest">
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
                className="mb-8 flex items-center overflow-x-auto no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0 py-1 gap-3 scroll-smooth select-none"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <button
                  id="tab-pln"
                  onClick={() => setActiveTab('pln')}
                  className={`flex items-center px-6 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 md:hover:-translate-y-0.5 pointer-events-auto shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border cursor-pointer ${
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
                  className={`flex items-center px-6 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 md:hover:-translate-y-0.5 pointer-events-auto shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border cursor-pointer ${
                    activeTab === 'nasional'
                      ? 'bg-[#860120] text-white border-[#860120] shadow-md shadow-[#860120]/20 font-black'
                      : 'bg-white/80 text-stone-700 hover:bg-stone-50 hover:text-red-600 border-white/60 backdrop-blur-md'
                  }`}
                >
                  <span>Berita SP PLN Nasional</span>
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
                {/* Active Category Header Banner */}
                <div className="mb-8 pb-3 border-b border-stone-200/80">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="font-serif text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                        {activeTab === 'pln' && 'Berita SP PLN Kalimantan Barat'}
                        {activeTab === 'nasional' && 'Berita SP PLN Nasional'}
                      </h2>
                    </div>
                  </div>
                </div>
                {featuredArticle ? (
                  <div className="mb-16">
                    <motion.div
                      layoutId={`card-container-${featuredArticle.id}`}
                      className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/75 backdrop-blur-md rounded-[2rem] p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(134,1,32,0.12)] border border-stone-200/50 transition-all duration-500 hover:-translate-y-2 relative"
                      onClick={() => setSelectedId(featuredArticle.id)}
                    >
                      <div className="lg:col-span-8 overflow-hidden rounded-3xl relative aspect-[16/10] shadow-inner font-sans">
                        <motion.img
                          layoutId={`image-${featuredArticle.id}`}
                          src={featuredArticle.imageUrl}
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          referrerPolicy="no-referrer"
                          loading="eager"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M')) {
                              target.src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000";
                            }
                          }}
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl pointer-events-none" />
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-4 py-2 bg-black/85 backdrop-blur-md text-xs font-bold uppercase tracking-wider rounded-full shadow-md text-stone-100 border border-white/10">
                            {featuredArticle.category}
                          </span>
                        </div>
                        {/* Share Button on Featured Article Image */}
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            type="button"
                            onClick={(e) => handleShareArticle(featuredArticle, e)}
                            className="p-2.5 rounded-full bg-black/60 hover:bg-red-700 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
                            title="Bagikan berita ini"
                            aria-label="Bagikan berita"
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="lg:col-span-4 flex flex-col justify-center px-4 sm:px-2 font-sans">
                        <div className="flex items-center justify-between gap-2 mb-5">
                          <motion.div layoutId={`meta-${featuredArticle.id}`} className="flex items-center space-x-3 text-sm text-stone-800 font-semibold">
                            <span className="text-red-700 font-extrabold">{featuredArticle.author}</span>
                            <span className="text-stone-400">&bull;</span>
                            <span className="flex items-center text-stone-900"><Clock size={16} className="mr-1.5 opacity-80" /> {featuredArticle.readTime}</span>
                          </motion.div>
                          <button
                            type="button"
                            onClick={(e) => handleShareArticle(featuredArticle, e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100/90 hover:bg-red-50 text-stone-700 hover:text-red-700 text-xs font-bold border border-stone-200/80 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                            title="Bagikan berita ini"
                            aria-label="Bagikan berita"
                          >
                            <Share2 size={13} />
                            <span>Bagikan</span>
                          </button>
                        </div>
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
                  <div className="flex flex-col items-center justify-center py-24 bg-white/70 backdrop-blur-md rounded-3xl border border-stone-200/90 shadow-sm border-dashed text-center px-6">
                    <div className="w-16 h-16 mb-4 bg-red-50 text-red-700 border border-red-200/80 rounded-2xl flex items-center justify-center shadow-xs">
                      <Menu size={28} />
                    </div>
                    <h3 className="font-serif text-2xl font-black text-stone-900 mb-2">
                      {activeTab === 'pln' ? 'Belum Ada Berita SP PLN Kalbar' : 'Belum Ada Berita SP PLN Nasional'}
                    </h3>
                    <p className="text-stone-600 max-w-lg text-sm leading-relaxed mb-4">
                      {activeTab === 'pln'
                        ? 'Belum ada artikel berita SP PLN Kalbar yang dipublikasikan di database SQLite server.'
                        : 'Belum ada artikel berita SP PLN nasional yang dipublikasikan di database SQLite server.'}
                    </p>
                    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                      isApiConnected 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      {isApiConnected ? 'Server Terhubung' : 'Server Tidak Terhubung'}
                    </span>
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
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M')) {
                                target.src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000";
                              }
                            }}
                          />
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl pointer-events-none" />
                          {/* Share Button on Sub Article Image */}
                          <div className="absolute top-3 right-3 z-10">
                            <button
                              type="button"
                              onClick={(e) => handleShareArticle(article, e)}
                              className="p-2 rounded-full bg-black/50 hover:bg-red-700 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
                              title="Bagikan berita ini"
                              aria-label="Bagikan berita"
                            >
                              <Share2 size={13} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col flex-1 px-3 pb-3">
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <motion.div layoutId={`meta-${article.id}`} className="flex items-center space-x-2 text-xs text-stone-800 uppercase tracking-wider font-bold">
                              <span className="text-red-700">{article.category}</span>
                              <span className="text-stone-400">&bull;</span>
                              <span className="text-stone-900">{article.readTime}</span>
                            </motion.div>
                            <button
                              type="button"
                              onClick={(e) => handleShareArticle(article, e)}
                              className="p-1.5 rounded-full bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 transition-all border border-stone-200/60 cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95"
                              title="Bagikan berita ini"
                              aria-label="Bagikan berita"
                            >
                              <Share2 size={13} />
                            </button>
                          </div>
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
              <span className="text-base font-black text-red-700 tracking-wide">{settings.footer_slogan_1 || "SP PLN! Yes! Kuat! Bersatu!"}</span>
              <span className="text-base font-black text-red-700 tracking-wide">{settings.footer_slogan_2 || "PLN! Jaya! Terbaik!"}</span>
              <span className="text-base font-black text-red-700 tracking-wide">Unbundling! <span className="text-red-800 font-black underline decoration-2">{settings.footer_slogan_3 || "NO!!!"}</span></span>
              <span className="text-lg font-black text-red-800 tracking-wide">{settings.footer_slogan_4 || "INDONESIA! Bangkit, Berdaulat, Merdeka, Merdeka, Merdeka!!!"}</span>
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
                  {settings.footer_address || "Jl. Gusti Sulung Lelanang No.14, Benua Melayu Darat, Kec. Pontianak Sel., Kota Pontianak, Kalimantan Barat 78243"}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-red-700 shrink-0" />
                <span className="text-gray-900">
                  {settings.footer_email || "dpdspplnkalbar@gmail.com"}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-emerald-700 shrink-0" />
                <span className="font-mono text-gray-900">
                  {settings.footer_phone || "+62 (561) 732-023"}
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
              onClick={handleCloseArticle}
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
                    onClick={handleCloseArticle}
                    className="p-2 sm:p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors pointer-events-auto shadow-md border border-white/5 cursor-pointer"
                    title="Kembali"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleShareArticle(selectedArticle, e)}
                    className="p-2 sm:p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-red-700 transition-colors pointer-events-auto shadow-md border border-white/5 cursor-pointer"
                    title="Bagikan berita ini"
                    aria-label="Bagikan berita"
                  >
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
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M')) {
                        target.src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000";
                      }
                    }}
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

                  {/* Share Action Callout in Article Modal */}
                  <div className="mt-12 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                    <p className="text-sm text-stone-600 font-medium text-center sm:text-left">
                      Bagikan informasi dan warta ini kepada rekan kerja atau grup komunikasi Anda.
                    </p>
                    <button
                      type="button"
                      onClick={(e) => handleShareArticle(selectedArticle, e)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 active:scale-95"
                    >
                      <Share2 size={16} />
                      <span>Bagikan Berita Ini</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deluxe Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-stone-950/95 backdrop-blur-xl"
              onClick={() => setSelectedPhoto(null)}
            />
            
            {/* Lightbox Content Window */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative max-w-5xl w-full max-h-[96vh] bg-stone-900 border border-stone-800 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              {/* Top Navigation & Actions Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-800/60 px-2.5 py-1 rounded-lg font-sans">
                    {currentPhotoIndex >= 0 ? `Foto ${currentPhotoIndex + 1} dari ${photos.length}` : 'Dokumentasi Kegiatan'}
                  </span>
                  <span className="text-xs text-stone-400 hidden sm:inline truncate max-w-xs md:max-w-md font-sans">
                    {selectedPhoto.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleSharePhoto(selectedPhoto, e)}
                    className="p-2 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl transition-all border border-stone-700 cursor-pointer"
                    title="Bagikan foto atau salin tautan"
                  >
                    <Share2 size={17} />
                  </button>
                  <a
                    href={selectedPhoto.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl transition-all border border-stone-700 cursor-pointer inline-flex items-center"
                    title="Buka Foto Resolusi Asli di Tab Baru"
                  >
                    <ExternalLink size={17} />
                  </a>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="p-2 bg-stone-800/80 hover:bg-red-700 text-stone-300 hover:text-white rounded-xl transition-all border border-stone-700 cursor-pointer"
                    title="Tutup (Esc)"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Main Image Area with Previous / Next Arrows */}
              <div className="relative flex-1 min-h-[300px] max-h-[62vh] bg-black flex items-center justify-center p-2 sm:p-4 select-none">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M')) {
                      target.src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
                    }
                  }}
                />

                {/* Left Arrow Button */}
                {photos.length > 1 && (
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-red-700 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10 shadow-lg cursor-pointer group"
                    aria-label="Foto Sebelumnya"
                  >
                    <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* Right Arrow Button */}
                {photos.length > 1 && (
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-red-700 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10 shadow-lg cursor-pointer group"
                    aria-label="Foto Selanjutnya"
                  >
                    <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {/* Caption & Metadata Sheet */}
              <div className="p-5 md:p-7 border-t border-stone-800 bg-stone-950/95 font-sans overflow-y-auto max-h-[30vh]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                    {selectedPhoto.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-semibold text-stone-400">
                    <span>📅 {selectedPhoto.date}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="text-red-400">📍 {selectedPhoto.location}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
                    Keterangan Foto:
                  </span>
                  <p className="text-sm md:text-base text-stone-300 leading-relaxed font-normal">
                    {selectedPhoto.description}
                  </p>
                </div>
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
                    <h2 className="text-xl md:text-2xl font-serif font-black text-stone-900">{settings.profile_title || "Profil Serikat Pekerja"}</h2>
                    <p className="text-xs text-stone-500 font-sans font-medium">{settings.profile_subtitle || "SP PLN Unit Induk Distribusi Kalimantan Barat"}</p>
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
                  <p className="mb-6 text-stone-700 font-medium whitespace-pre-line">
                    {settings.profile_about || "Serikat Pekerja PT PLN (Persero) Unit Induk Distribusi Kalimantan Barat merupakan wadah kebersamaan dan perjuangan karyawan yang berasaskan Pancasila and UUD 1945. Kami berkomitmen mendukung keandalan listrik bagi seluruh rakyat Kalimantan Barat sekaligus memperjuangkan hak-hak normatif dan kesejahteraan bagi seluruh anggota."}
                  </p>
 
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Visi &amp; Misi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-red-50/70 rounded-2xl border border-red-100">
                      <h4 className="font-sans font-bold text-red-800 mb-1.5">Visi &amp; Misi</h4>
                      <div className="text-xs leading-relaxed text-stone-700 space-y-2 whitespace-pre-line">
                        {settings.profile_visi || "Menjaga kesinambungan PT PLN (Persero) agar tetap tumbuh dan berkembang sebagai Pengemban Amanah Konstitusi dibidang Ketenagalistrikan yang terintegrasi dari Pembangkitan, transmisi, distribusi dan penjualan;"}
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100">
                      <h4 className="font-sans font-bold text-amber-800 mb-1.5">Komitmen</h4>
                      <p className="text-xs leading-relaxed text-stone-700">SP PLN Kalbar Solid, Kuat, Berdaulat.</p>
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Nilai Dasar</h3>
                  <p className="mb-4 text-stone-700 font-medium whitespace-pre-line">
                    {settings.profile_nilai || "Melalui semangat kemitraan yang produktif, kami berkomitmen menjaga dedikasi pelayanan tanpa putus, kesetiaan penuh kawan sekerja, serta kepatuhan penuh akan keselamatan kerja demi keberlangsungan pelayanan kelistrikan bagi masyarakat luas."}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast Notification for Share and Copy Actions */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-stone-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-stone-700/80 pointer-events-none"
          >
            <Check size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Autentikasi Login Administrator */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          setIsAuthenticated(true);
          setAdminUser(user);
          setIsAdminPanelOpen(true);
          setIsProfileOpen(false);
          setIsPhotoGalleryOpen(false);
          setSelectedId(null);
        }}
        showToast={showToast}
      />
    </div>
  );
}

