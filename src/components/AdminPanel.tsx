import { useState, useMemo } from 'react';
import { 
  ShieldCheck, PlusCircle, Newspaper, Globe, Camera, ArrowLeft,
  CheckCircle2, Image as ImageIcon, Trash2, Eye, LogOut,
  ExternalLink, Calendar, MapPin, User, Pencil, X, Save,
  Key, Lock, EyeOff, AlertCircle, XCircle
} from 'lucide-react';
import type { Article, ActivityPhoto } from '../data';
import { formatDriveImageUrl, getIndonesianFormattedDate, calculateReadTime } from '../utils';
import { apiService, API_BASE_URL } from '../services/api';
import { authService } from '../services/auth';

interface AdminPanelProps {
  onAddPlnArticle: (article: Omit<Article, 'id'>) => void;
  onAddNasionalArticle: (article: Omit<Article, 'id'>) => void;
  onAddPhoto: (photo: Omit<ActivityPhoto, 'id'>) => void;
  onUpdatePlnArticle?: (id: string, updated: Partial<Article>) => void;
  onUpdateNasionalArticle?: (id: string, updated: Partial<Article>) => void;
  onUpdatePhoto?: (id: string, updated: Partial<ActivityPhoto>) => void;
  onDeletePlnArticle: (id: string) => void;
  onDeleteNasionalArticle: (id: string) => void;
  onDeletePhoto: (id: string) => void;
  plnArticles: Article[];
  nasionalArticles: Article[];
  photos: ActivityPhoto[];
  customPlnIds?: Set<string>;
  customNasionalIds?: Set<string>;
  customPhotoIds?: Set<string>;
  isApiConnected?: boolean;
  adminUsername?: string;
  settings?: Record<string, string>;
  onUpdateSettings?: (settings: Record<string, string>) => Promise<void>;
  onClose: () => void;
  onExitAdminMode: () => void;
  onViewArticle: (id: string) => void;
  onViewPhoto: (photo: ActivityPhoto) => void;
  showToast: (msg: string) => void;
}

export function AdminPanel({
  onAddPlnArticle,
  onAddNasionalArticle,
  onAddPhoto,
  onUpdatePlnArticle,
  onUpdateNasionalArticle,
  onUpdatePhoto,
  onDeletePlnArticle,
  onDeleteNasionalArticle,
  onDeletePhoto,
  plnArticles,
  nasionalArticles,
  photos,
  customPlnIds = new Set(),
  customNasionalIds = new Set(),
  customPhotoIds = new Set(),
  isApiConnected = false,
  adminUsername,
  settings = {},
  onUpdateSettings,
  onClose,
  onExitAdminMode,
  onViewArticle,
  onViewPhoto,
  showToast,
}: AdminPanelProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<'tambah-pln' | 'tambah-nasional' | 'tambah-foto' | 'kelola' | 'edit-profil' | 'edit-footer' | 'ganti-password'>('tambah-pln');

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Computed password criteria validation
  const passwordCriteria = useMemo(() => {
    return {
      minLength: newPassword.length >= 10,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const passwordScore = useMemo(() => {
    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria]);

  const isPasswordValid = passwordScore === 5;

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validasi Frontend
    if (!currentPassword) {
      setPasswordError('Password saat ini wajib diisi.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Password baru wajib diisi.');
      return;
    }
    if (!confirmPassword) {
      setPasswordError('Konfirmasi password wajib diisi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.');
      return;
    }
    if (!isPasswordValid) {
      setPasswordError('Password baru belum memenuhi persyaratan keamanan.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      showToast('Password berhasil diubah.');
      setPasswordSuccess('Password berhasil diubah.');

      // Redirection / log out after password change success
      setTimeout(() => {
        onExitAdminMode();
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || 'Password saat ini salah.';
      if (msg.includes('Password saat ini salah')) {
        setPasswordError('Password saat ini salah.');
      } else if (msg.includes('belum memenuhi persyaratan')) {
        setPasswordError('Password baru belum memenuhi persyaratan keamanan.');
      } else {
        setPasswordError(msg);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    profile_title: settings?.profile_title || "Profil Serikat Pekerja",
    profile_subtitle: settings?.profile_subtitle || "SP PLN Unit Induk Distribusi Kalimantan Barat",
    profile_about: settings?.profile_about || "",
    profile_visi: settings?.profile_visi || "",
    profile_nilai: settings?.profile_nilai || "",
  });

  // Footer edit state
  const [footerForm, setFooterForm] = useState({
    footer_slogan_1: settings?.footer_slogan_1 || "",
    footer_slogan_2: settings?.footer_slogan_2 || "",
    footer_slogan_3: settings?.footer_slogan_3 || "",
    footer_slogan_4: settings?.footer_slogan_4 || "",
    footer_address: settings?.footer_address || "",
    footer_email: settings?.footer_email || "",
    footer_phone: settings?.footer_phone || "",
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSettings) {
      try {
        await onUpdateSettings({ ...settings, ...profileForm });
        showToast('Profil SP PLN Kalbar berhasil diperbarui!');
      } catch (err: any) {
        alert(err?.message || 'Gagal memperbarui profil');
      }
    }
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSettings) {
      try {
        await onUpdateSettings({ ...settings, ...footerForm });
        showToast('Kontak & Alamat Footer berhasil diperbarui!');
      } catch (err: any) {
        alert(err?.message || 'Gagal memperbarui footer');
      }
    }
  };

  // Edit article state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  // Edit photo state
  const [editingPhoto, setEditingPhoto] = useState<ActivityPhoto | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [editPhotoDescription, setEditPhotoDescription] = useState('');
  const [editPhotoDate, setEditPhotoDate] = useState('');
  const [editPhotoLocation, setEditPhotoLocation] = useState('');
  const [editPhotoImageUrl, setEditPhotoImageUrl] = useState('');

  const openEditArticle = (article: Article) => {
    setEditingArticle(article);
    setEditTitle(article.title || '');
    setEditExcerpt(article.excerpt || '');
    setEditContent(article.content || '');
    setEditAuthor(article.author || '');
    setEditDate(article.date || '');
    setEditImageUrl(article.imageUrl || '');
  };

  const openEditPhoto = (photo: ActivityPhoto) => {
    setEditingPhoto(photo);
    setEditPhotoTitle(photo.title || '');
    setEditPhotoDescription(photo.description || '');
    setEditPhotoDate(photo.date || '');
    setEditPhotoLocation(photo.location || '');
    setEditPhotoImageUrl(photo.imageUrl || '');
  };

  const handleSaveEditArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    if (!editTitle.trim()) {
      showToast('Judul artikel tidak boleh kosong!');
      return;
    }
    if (!editContent.trim()) {
      showToast('Isi artikel tidak boleh kosong!');
      return;
    }

    const finalImage = formatDriveImageUrl(editImageUrl) || editingArticle.imageUrl;
    const finalExcerpt = editExcerpt.trim() || (editContent.trim().slice(0, 160) + '...');
    const readTime = calculateReadTime(`${editTitle} ${finalExcerpt} ${editContent}`);

    const updatedData: Partial<Article> = {
      title: editTitle.trim(),
      excerpt: finalExcerpt,
      content: editContent.trim(),
      author: editAuthor.trim() || editingArticle.author,
      date: editDate.trim() || editingArticle.date,
      imageUrl: finalImage,
      readTime
    };

    if (editingArticle.category === 'Berita Nasional' || editingArticle.type === 'nasional') {
      onUpdateNasionalArticle?.(editingArticle.id, updatedData);
    } else {
      onUpdatePlnArticle?.(editingArticle.id, updatedData);
    }

    setEditingArticle(null);
  };

  const handleSaveEditPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    if (!editPhotoTitle.trim()) {
      showToast('Judul foto tidak boleh kosong!');
      return;
    }

    const finalImage = formatDriveImageUrl(editPhotoImageUrl) || editingPhoto.imageUrl;

    onUpdatePhoto?.(editingPhoto.id, {
      title: editPhotoTitle.trim(),
      description: editPhotoDescription.trim(),
      date: editPhotoDate.trim() || editingPhoto.date,
      location: editPhotoLocation.trim() || editingPhoto.location,
      imageUrl: finalImage
    });

    setEditingPhoto(null);
  };

  // Form states for Berita SP PLN Kalbar
  const [plnTitle, setPlnTitle] = useState('');
  const [plnExcerpt, setPlnExcerpt] = useState('');
  const [plnContent, setPlnContent] = useState('');
  const [plnAuthor, setPlnAuthor] = useState('Humas SP PLN UID Kalbar');
  const [plnDate, setPlnDate] = useState(() => getIndonesianFormattedDate());
  const [plnImageUrl, setPlnImageUrl] = useState('');

  // Form states for Berita Nasional
  const [nasionalTitle, setNasionalTitle] = useState('');
  const [nasionalExcerpt, setNasionalExcerpt] = useState('');
  const [nasionalContent, setNasionalContent] = useState('');
  const [nasionalAuthor, setNasionalAuthor] = useState('Redaksi Nasional');
  const [nasionalDate, setNasionalDate] = useState(() => getIndonesianFormattedDate());
  const [nasionalImageUrl, setNasionalImageUrl] = useState('');

  // Form states for Foto Kegiatan
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoDate, setPhotoDate] = useState(() => {
    const now = new Date();
    return `${now.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][now.getMonth()]} ${now.getFullYear()}`;
  });
  const [photoLocation, setPhotoLocation] = useState('Pontianak, Kalimantan Barat');
  const [photoImageUrl, setPhotoImageUrl] = useState('');

  // Live preview formatted URLs
  const plnPreviewUrl = useMemo(() => formatDriveImageUrl(plnImageUrl), [plnImageUrl]);
  const nasionalPreviewUrl = useMemo(() => formatDriveImageUrl(nasionalImageUrl), [nasionalImageUrl]);
  const photoPreviewUrl = useMemo(() => formatDriveImageUrl(photoImageUrl), [photoImageUrl]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 10 MB.");
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.");
      e.target.value = '';
      return;
    }

    try {
      const uploadedUrl = await apiService.uploadImage(file);
      const fullUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `${API_BASE_URL}${uploadedUrl}`;
      setUrl(fullUrl);
      showToast('Gambar berhasil diunggah dan lolos validasi!');
    } catch (err: any) {
      alert(err?.message || "Gagal mengunggah gambar.");
      e.target.value = '';
    }
  };

  // Submit Berita SP PLN Kalbar
  const handleSubmitPln = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plnTitle.trim()) {
      showToast('Harap masukkan judul berita SP PLN Kalbar!');
      return;
    }
    if (!plnContent.trim()) {
      showToast('Harap masukkan isi berita lengkap!');
      return;
    }

    const finalImage = plnPreviewUrl || "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
    const finalExcerpt = plnExcerpt.trim() || (plnContent.trim().slice(0, 160) + '...');
    const readTime = calculateReadTime(`${plnTitle} ${finalExcerpt} ${plnContent}`);

    onAddPlnArticle({
      title: plnTitle.trim(),
      excerpt: finalExcerpt,
      content: plnContent.trim(),
      author: plnAuthor.trim() || 'Humas SP PLN UID Kalbar',
      date: plnDate.trim() || getIndonesianFormattedDate(),
      category: "SP PLN Kalimantan Barat",
      imageUrl: finalImage,
      readTime
    });

    // Reset form
    setPlnTitle('');
    setPlnExcerpt('');
    setPlnContent('');
    setPlnImageUrl('');
    setPlnDate(getIndonesianFormattedDate());
    showToast('Berhasil menambahkan Berita SP PLN Kalbar baru!');
  };

  // Submit Berita Nasional
  const handleSubmitNasional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nasionalTitle.trim()) {
      showToast('Harap masukkan judul berita nasional!');
      return;
    }
    if (!nasionalContent.trim()) {
      showToast('Harap masukkan isi berita lengkap!');
      return;
    }

    const finalImage = nasionalPreviewUrl || "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
    const finalExcerpt = nasionalExcerpt.trim() || (nasionalContent.trim().slice(0, 160) + '...');
    const readTime = calculateReadTime(`${nasionalTitle} ${finalExcerpt} ${nasionalContent}`);

    onAddNasionalArticle({
      title: nasionalTitle.trim(),
      excerpt: finalExcerpt,
      content: nasionalContent.trim(),
      author: nasionalAuthor.trim() || 'Redaksi Nasional',
      date: nasionalDate.trim() || getIndonesianFormattedDate(),
      category: "Berita Nasional",
      imageUrl: finalImage,
      readTime
    });

    // Reset form
    setNasionalTitle('');
    setNasionalExcerpt('');
    setNasionalContent('');
    setNasionalImageUrl('');
    setNasionalDate(getIndonesianFormattedDate());
    showToast('Berhasil menambahkan Berita Nasional baru!');
  };

  // Submit Foto Kegiatan
  const handleSubmitPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) {
      showToast('Harap masukkan judul foto kegiatan!');
      return;
    }
    if (!photoImageUrl.trim()) {
      showToast('Harap masukkan link atau tautan foto kegiatan!');
      return;
    }

    const finalImage = photoPreviewUrl || "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";

    onAddPhoto({
      title: photoTitle.trim(),
      description: photoDescription.trim() || 'Dokumentasi resmi kegiatan Serikat Pekerja PLN UID Kalimantan Barat.',
      date: photoDate.trim() || 'Dokumentasi Terkini',
      imageUrl: finalImage,
      location: photoLocation.trim() || 'Kalimantan Barat'
    });

    // Reset form
    setPhotoTitle('');
    setPhotoDescription('');
    setPhotoImageUrl('');
    showToast('Berhasil menambahkan Foto Kegiatan baru ke Galeri!');
  };

  return (
    <div className="animate-fade-in font-sans">
      {/* Admin Top Header Navigation & Status Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
              <ShieldCheck size={14} className="text-amber-700" />
              {adminUsername ? `Admin: ${adminUsername}` : 'Mode Administrator'}
            </span>
            {isApiConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Server Terhubung
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Server Tidak Terhubung
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-black text-stone-900 leading-tight">
            Panel Administrator
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Tambah dan kelola Berita SP PLN Kalbar, Berita Nasional, serta Galeri Foto Kegiatan secara langsung.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 hover:text-red-700 text-xs sm:text-sm font-semibold border border-stone-200/90 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Halaman Berita</span>
          </button>

          <button
            type="button"
            onClick={onExitAdminMode}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold border border-stone-200 transition-all cursor-pointer"
            title="Keluar dari mode admin"
          >
            <LogOut size={15} />
            <span>Keluar Admin</span>
          </button>
        </div>
      </div>

      {/* Category Tabs Inside Admin Panel */}
      <div className="mb-8 flex items-center overflow-x-auto no-scrollbar gap-2 pb-1 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveAdminTab('tambah-pln')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeAdminTab === 'tambah-pln'
              ? 'bg-[#860120] text-white shadow-md shadow-[#860120]/20'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <Newspaper size={16} />
          <span>Tambah Berita SP PLN Kalbar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('tambah-nasional')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeAdminTab === 'tambah-nasional'
              ? 'bg-[#860120] text-white shadow-md shadow-[#860120]/20'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <Globe size={16} />
          <span>Tambah Berita SP PLN Nasional</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('tambah-foto')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeAdminTab === 'tambah-foto'
              ? 'bg-[#860120] text-white shadow-md shadow-[#860120]/20'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <Camera size={16} />
          <span>Tambah Foto Kegiatan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('kelola')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeAdminTab === 'kelola'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Daftar &amp; Kelola Konten</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700 font-bold">
            {customPlnIds.size + customNasionalIds.size + customPhotoIds.size} Baru
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('edit-profil')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeAdminTab === 'edit-profil'
              ? 'bg-[#860120] text-white shadow-md shadow-[#860120]/20'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <User size={16} />
          <span>Ubah Profil SP PLN</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('edit-footer')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeAdminTab === 'edit-footer'
              ? 'bg-[#860120] text-white shadow-md shadow-[#860120]/20'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <MapPin size={16} />
          <span>Ubah Kontak &amp; Footer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('ganti-password')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeAdminTab === 'ganti-password'
              ? 'bg-[#860120] text-white shadow-md shadow-[#860120]/20'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <Key size={16} />
          <span>Ganti Password Admin</span>
        </button>
      </div>

      {/* 1. Form: Tambah Berita SP PLN Kalbar */}
      {activeAdminTab === 'tambah-pln' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
          <div className="mb-6 pb-4 border-b border-stone-100">
            <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Newspaper className="text-red-700" size={24} />
              Form Input Berita SP PLN Kalimantan Barat
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Kategori: <strong>SP PLN Kalimantan Barat</strong> (Otomatis tampil di tab Berita SP PLN Kalbar).
            </p>
          </div>

          <form onSubmit={handleSubmitPln} className="space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Judul Berita <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={plnTitle}
                onChange={(e) => setPlnTitle(e.target.value)}
                placeholder="Contoh: Rapat Kerja Daerah DPD SP PLN UID Kalbar Bahas Kesejahteraan dan Kedaulatan Energi"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Sub Berita / Ringkasan Lead (Opsional)
              </label>
              <input
                type="text"
                value={plnExcerpt}
                onChange={(e) => setPlnExcerpt(e.target.value)}
                placeholder="Ringkasan 1-2 kalimat pengantar yang akan tampil pada kartu cuplikan berita..."
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Nama Penulis / Reporter
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={plnAuthor}
                    onChange={(e) => setPlnAuthor(e.target.value)}
                    placeholder="Contoh: Humas SP PLN UID Kalbar"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Tanggal &amp; Waktu Terbit
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={plnDate}
                    onChange={(e) => setPlnDate(e.target.value)}
                    placeholder="Contoh: Sabtu, 26 September 2026 • 10.30 WIB"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Link Foto Berita (Google Drive / URL JPG/PNG)
              </label>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={plnImageUrl}
                  onChange={(e) => setPlnImageUrl(e.target.value)}
                  placeholder="Tempel link Google Drive atau URL foto JPG/PNG di sini..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none font-mono text-xs"
                />
              </div>
              <div className="mt-2.5">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Atau Upload File Gambar (JPG, PNG, WebP • Maks. 10MB):
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, setPlnImageUrl)}
                  className="text-xs text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Mendukung semua format link Google Drive (otomatis dikonversi ke gambar resolusi tinggi) atau upload file langsung (Maks. 10MB).
              </p>

              {/* Preview image */}
              {plnPreviewUrl && (
                <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 max-w-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">
                    Pratinjau Foto Berita:
                  </span>
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-stone-200 relative">
                    <img
                      src={plnPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Isi Berita Lengkap <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={9}
                value={plnContent}
                onChange={(e) => setPlnContent(e.target.value)}
                placeholder="Tuliskan isi berita lengkap di sini. Tekan Enter untuk paragraf baru..."
                className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm leading-relaxed transition-all outline-none"
                required
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#860120] hover:bg-[#6c011a] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle size={18} />
                <span>Publikasikan Berita SP PLN Kalbar</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Form: Tambah Berita Nasional */}
      {activeAdminTab === 'tambah-nasional' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
          <div className="mb-6 pb-4 border-b border-stone-100">
            <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Globe className="text-red-700" size={24} />
              Form Input Berita Nasional
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Kategori: <strong>Berita Nasional</strong> (Otomatis tampil di tab Berita Nasional).
            </p>
          </div>

          <form onSubmit={handleSubmitNasional} className="space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Judul Berita Nasional <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={nasionalTitle}
                onChange={(e) => setNasionalTitle(e.target.value)}
                placeholder="Contoh: SP PLN Seluruh Indonesia Deklarasikan Komitmen Menjaga Listrik Tetap Terjangkau"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Sub Berita / Ringkasan Lead (Opsional)
              </label>
              <input
                type="text"
                value={nasionalExcerpt}
                onChange={(e) => setNasionalExcerpt(e.target.value)}
                placeholder="Ringkasan singkat berita nasional yang memikat pembaca..."
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Penulis / Redaksi
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={nasionalAuthor}
                    onChange={(e) => setNasionalAuthor(e.target.value)}
                    placeholder="Contoh: Redaksi Nasional"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Tanggal &amp; Waktu Terbit
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={nasionalDate}
                    onChange={(e) => setNasionalDate(e.target.value)}
                    placeholder="Contoh: Sabtu, 26 September 2026 • 11.00 WIB"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Link Foto Berita (Google Drive / URL JPG/PNG)
              </label>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={nasionalImageUrl}
                  onChange={(e) => setNasionalImageUrl(e.target.value)}
                  placeholder="Tempel link Google Drive atau URL foto JPG/PNG di sini..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none font-mono text-xs"
                />
              </div>
              <div className="mt-2.5">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Atau Upload File Gambar (JPG, PNG, WebP • Maks. 10MB):
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, setNasionalImageUrl)}
                  className="text-xs text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
              </div>

              {/* Preview image */}
              {nasionalPreviewUrl && (
                <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 max-w-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">
                    Pratinjau Foto Berita Nasional:
                  </span>
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-stone-200 relative">
                    <img
                      src={nasionalPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Isi Berita Lengkap <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={9}
                value={nasionalContent}
                onChange={(e) => setNasionalContent(e.target.value)}
                placeholder="Tuliskan isi berita nasional secara komprehensif di sini..."
                className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm leading-relaxed transition-all outline-none"
                required
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#860120] hover:bg-[#6c011a] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle size={18} />
                <span>Publikasikan Berita Nasional</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Form: Tambah Foto Kegiatan */}
      {activeAdminTab === 'tambah-foto' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
          <div className="mb-6 pb-4 border-b border-stone-100">
            <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Camera className="text-red-700" size={24} />
              Form Input Foto Kegiatan
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Kategori: <strong>Galeri Foto Kegiatan</strong> (Otomatis tampil di menu Foto Kegiatan).
            </p>
          </div>

          <form onSubmit={handleSubmitPhoto} className="space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Judul / Nama Kegiatan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="Contoh: Konsolidasi DPD SP PLN Kalbar Bersama DPC se-Kalimantan Barat"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Tanggal Kegiatan
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    placeholder="Contoh: 26 September 2026"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Lokasi Kegiatan
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={photoLocation}
                    onChange={(e) => setPhotoLocation(e.target.value)}
                    placeholder="Contoh: Pontianak, Kalimantan Barat"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Link Foto Kegiatan (Google Drive / URL JPG/PNG) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={photoImageUrl}
                  onChange={(e) => setPhotoImageUrl(e.target.value)}
                  placeholder="Tempel link Google Drive atau link file foto di sini..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm transition-all outline-none font-mono text-xs"
                  required
                />
              </div>
              <div className="mt-2.5">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Atau Upload File Gambar (JPG, PNG, WebP • Maks. 10MB):
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, setPhotoImageUrl)}
                  className="text-xs text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
              </div>

              {/* Preview image */}
              {photoPreviewUrl && (
                <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 max-w-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">
                    Pratinjau Foto Kegiatan:
                  </span>
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-stone-200 relative">
                    <img
                      src={photoPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Keterangan / Deskripsi Foto Kegiatan
              </label>
              <textarea
                rows={5}
                value={photoDescription}
                onChange={(e) => setPhotoDescription(e.target.value)}
                placeholder="Tuliskan keterangan detail foto kegiatan, siapa saja yang hadir, serta agenda yang dilaksanakan..."
                className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm leading-relaxed transition-all outline-none"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#860120] hover:bg-[#6c011a] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle size={18} />
                <span>Simpan ke Galeri Foto Kegiatan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Tab: Daftar Konten & Kelola */}
      {activeAdminTab === 'kelola' && (
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Berita SP PLN Kalbar
                </span>
                <Newspaper size={18} className="text-red-700" />
              </div>
              <div className="text-3xl font-serif font-black text-stone-900">
                {plnArticles.length}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {customPlnIds.size} ditambahkan lewat panel admin
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Berita Nasional
                </span>
                <Globe size={18} className="text-red-700" />
              </div>
              <div className="text-3xl font-serif font-black text-stone-900">
                {nasionalArticles.length}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {customNasionalIds.size} ditambahkan lewat panel admin
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Foto Kegiatan
                </span>
                <Camera size={18} className="text-red-700" />
              </div>
              <div className="text-3xl font-serif font-black text-stone-900">
                {photos.length}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {customPhotoIds.size} ditambahkan lewat panel admin
              </p>
            </div>
          </div>

          {/* Section: Berita SP PLN Kalbar List */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <Newspaper size={18} className="text-red-700" />
                Daftar Berita SP PLN Kalimantan Barat
              </h3>
              <span className="text-xs font-semibold text-stone-500">
                Total: {plnArticles.length}
              </span>
            </div>

            {plnArticles.length === 0 ? (
              <p className="text-stone-500 text-sm py-4 text-center">Belum ada berita SP PLN Kalbar.</p>
            ) : (
              <div className="space-y-3">
                {plnArticles.map((article, idx) => {
                  const isSqlite = !article.id.startsWith('sheet-');
                  return (
                    <div
                      key={article.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-stone-50/80 hover:bg-stone-50 border border-stone-200/80 transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-14 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                          <img
                            src={article.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-stone-400">#{idx + 1}</span>
                            {isSqlite ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Database SQLite
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700">
                                Spreadsheet (Fallback)
                              </span>
                            )}
                            <span className="text-xs text-stone-400 truncate hidden md:inline">{article.date}</span>
                          </div>
                          <h4 className="font-serif font-bold text-sm text-stone-900 truncate mt-0.5">
                            {article.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => onViewArticle(article.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-200 text-xs font-semibold transition-all cursor-pointer"
                          title="Lihat Berita"
                        >
                          <Eye size={13} />
                          <span>Lihat</span>
                        </button>

                        {isSqlite && onUpdatePlnArticle && (
                          <button
                            type="button"
                            onClick={() => openEditArticle(article)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 border border-stone-200 text-xs font-semibold transition-all cursor-pointer"
                            title="Edit Berita (PUT /api/articles/:id)"
                          >
                            <Pencil size={13} />
                            <span>Edit</span>
                          </button>
                        )}

                        {isSqlite && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus berita "${article.title}"?`)) {
                                onDeletePlnArticle(article.id);
                              }
                            }}
                            className="p-1.5 rounded-xl hover:bg-red-100 text-stone-400 hover:text-red-700 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                            title="Hapus Berita dari Database"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Berita Nasional List */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <Globe size={18} className="text-red-700" />
                Daftar Berita Nasional
              </h3>
              <span className="text-xs font-semibold text-stone-500">
                Total: {nasionalArticles.length}
              </span>
            </div>

            {nasionalArticles.length === 0 ? (
              <p className="text-stone-500 text-sm py-4 text-center">Belum ada berita nasional.</p>
            ) : (
              <div className="space-y-3">
                {nasionalArticles.map((article, idx) => {
                  const isSqlite = !article.id.startsWith('sheet-');
                  return (
                    <div
                      key={article.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-stone-50/80 hover:bg-stone-50 border border-stone-200/80 transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-14 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                          <img
                            src={article.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-stone-400">#{idx + 1}</span>
                            {isSqlite ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Database SQLite
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700">
                                Spreadsheet (Fallback)
                              </span>
                            )}
                            <span className="text-xs text-stone-400 truncate hidden md:inline">{article.date}</span>
                          </div>
                          <h4 className="font-serif font-bold text-sm text-stone-900 truncate mt-0.5">
                            {article.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => onViewArticle(article.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-200 text-xs font-semibold transition-all cursor-pointer"
                          title="Lihat Berita"
                        >
                          <Eye size={13} />
                          <span>Lihat</span>
                        </button>

                        {isSqlite && onUpdateNasionalArticle && (
                          <button
                            type="button"
                            onClick={() => openEditArticle(article)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 border border-stone-200 text-xs font-semibold transition-all cursor-pointer"
                            title="Edit Berita (PUT /api/articles/:id)"
                          >
                            <Pencil size={13} />
                            <span>Edit</span>
                          </button>
                        )}

                        {isSqlite && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus berita nasional "${article.title}"?`)) {
                                onDeleteNasionalArticle(article.id);
                              }
                            }}
                            className="p-1.5 rounded-xl hover:bg-red-100 text-stone-400 hover:text-red-700 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                            title="Hapus Berita dari Database"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Foto Kegiatan List */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <Camera size={18} className="text-red-700" />
                Daftar Foto Kegiatan
              </h3>
              <span className="text-xs font-semibold text-stone-500">
                Total: {photos.length}
              </span>
            </div>

            {photos.length === 0 ? (
              <p className="text-stone-500 text-sm py-4 text-center">Belum ada foto kegiatan.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, idx) => {
                  const isSqlite = !photo.id.startsWith('sheet-');
                  return (
                    <div
                      key={photo.id}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="aspect-[16/10] rounded-xl overflow-hidden bg-stone-200 relative mb-2">
                          <img
                            src={photo.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1600";
                            }}
                          />
                          <div className="absolute top-2 left-2">
                            {isSqlite ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 backdrop-blur-sm">
                                Database SQLite
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                                #{idx + 1}
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                          {photo.title}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-sans">
                          {photo.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                        <span className="text-stone-400 text-[11px] truncate">{photo.location}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewPhoto(photo)}
                            className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 cursor-pointer"
                            title="Buka Foto"
                          >
                            <Eye size={13} />
                          </button>
                          {isSqlite && onUpdatePhoto && (
                            <button
                              type="button"
                              onClick={() => openEditPhoto(photo)}
                              className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 border border-stone-200 cursor-pointer"
                              title="Edit Foto (PUT /api/photos/:id)"
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                          {isSqlite && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus foto "${photo.title}"?`)) {
                                  onDeletePhoto(photo.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-stone-400 hover:text-red-700 cursor-pointer"
                              title="Hapus Foto dari Database"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Article Modal (PUT /api/articles/:id) */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Pencil size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Edit {editingArticle.category === 'Berita Nasional' ? 'Berita Nasional' : 'Berita SP PLN Kalbar'}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">PUT /api/articles/{editingArticle.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Judul Berita <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Ringkasan / Lead Berita
                </label>
                <textarea
                  rows={2}
                  value={editExcerpt}
                  onChange={(e) => setEditExcerpt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Isi Berita Lengkap <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={6}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Penulis / Redaksi
                  </label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Tautan Foto (URL / Google Drive)
                </label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                />
                <div className="mt-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Upload File Gambar Baru (JPG, PNG, WebP • Maks. 10MB):
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileUpload(e, setEditImageUrl)}
                    className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-5 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#860120] hover:bg-red-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Photo Modal (PUT /api/photos/:id) */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Pencil size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Edit Foto Kegiatan
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">PUT /api/photos/{editingPhoto.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Judul Foto Kegiatan <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={editPhotoTitle}
                  onChange={(e) => setEditPhotoTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Keterangan Dokumentasi
                </label>
                <textarea
                  rows={3}
                  value={editPhotoDescription}
                  onChange={(e) => setEditPhotoDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="text"
                    value={editPhotoDate}
                    onChange={(e) => setEditPhotoDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Lokasi Kegiatan
                  </label>
                  <input
                    type="text"
                    value={editPhotoLocation}
                    onChange={(e) => setEditPhotoLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Tautan Foto (URL / Google Drive)
                </label>
                <input
                  type="text"
                  value={editPhotoImageUrl}
                  onChange={(e) => setEditPhotoImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120]"
                />
                <div className="mt-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Upload File Gambar Baru (JPG, PNG, WebP • Maks. 10MB):
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileUpload(e, setEditPhotoImageUrl)}
                    className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-5 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#860120] hover:bg-red-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profil Form */}
      {activeAdminTab === 'edit-profil' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
          <div className="mb-6 pb-4 border-b border-stone-100">
            <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
              <User className="text-red-700" size={24} />
              Ubah Tulisan Profil SP PLN Kalbar
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Sesuaikan informasi tentang kami, visi, dan nilai dasar yang tampil saat pengunjung membuka menu Profil.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Judul Profil
              </label>
              <input
                type="text"
                value={profileForm.profile_title}
                onChange={(e) => setProfileForm({ ...profileForm, profile_title: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Sub Judul / Keterangan Unit
              </label>
              <input
                type="text"
                value={profileForm.profile_subtitle}
                onChange={(e) => setProfileForm({ ...profileForm, profile_subtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Tentang Kami (Paragraf Utama)
              </label>
              <textarea
                rows={4}
                value={profileForm.profile_about}
                onChange={(e) => setProfileForm({ ...profileForm, profile_about: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Visi &amp; Misi (Poin-poin)
              </label>
              <textarea
                rows={5}
                value={profileForm.profile_visi}
                onChange={(e) => setProfileForm({ ...profileForm, profile_visi: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Nilai Dasar
              </label>
              <textarea
                rows={3}
                value={profileForm.profile_nilai}
                onChange={(e) => setProfileForm({ ...profileForm, profile_nilai: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none leading-relaxed"
                required
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#860120] hover:bg-red-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Save size={18} />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Footer Form */}
      {activeAdminTab === 'edit-footer' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
          <div className="mb-6 pb-4 border-b border-stone-100">
            <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="text-red-700" size={24} />
              Ubah Kontak &amp; Alamat Kantor Footer
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Sesuaikan alamat kantor, email, nomor telepon, dan slogan yel-yel perjuangan yang tampil pada bagian bawah (footer) website.
            </p>
          </div>

          <form onSubmit={handleSaveFooter} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Slogan Baris 1
                </label>
                <input
                  type="text"
                  value={footerForm.footer_slogan_1}
                  onChange={(e) => setFooterForm({ ...footerForm, footer_slogan_1: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Slogan Baris 2
                </label>
                <input
                  type="text"
                  value={footerForm.footer_slogan_2}
                  onChange={(e) => setFooterForm({ ...footerForm, footer_slogan_2: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Slogan Baris 3
                </label>
                <input
                  type="text"
                  value={footerForm.footer_slogan_3}
                  onChange={(e) => setFooterForm({ ...footerForm, footer_slogan_3: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Slogan Baris 4 (Utama)
                </label>
                <input
                  type="text"
                  value={footerForm.footer_slogan_4}
                  onChange={(e) => setFooterForm({ ...footerForm, footer_slogan_4: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                Alamat Kantor Sekretariat
              </label>
              <textarea
                rows={3}
                value={footerForm.footer_address}
                onChange={(e) => setFooterForm({ ...footerForm, footer_address: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Email Kontak
                </label>
                <input
                  type="email"
                  value={footerForm.footer_email}
                  onChange={(e) => setFooterForm({ ...footerForm, footer_email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={footerForm.footer_phone}
                  onChange={(e) => setFooterForm({ ...footerForm, footer_phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-stone-900 text-sm outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#860120] hover:bg-red-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Save size={18} />
                <span>Simpan Perubahan Kontak &amp; Footer</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Form: Ganti Password Admin */}
      {activeAdminTab === 'ganti-password' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-3xl mx-auto">
          <div className="mb-6 pb-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-700 mb-1 flex items-center gap-1.5">
                <User size={13} />
                <span>Pengaturan Akun</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Key className="text-red-700" size={24} />
                Ganti Password Administrator
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Satu akun administrator utama. Perbarui kata sandi secara berkala untuk menjaga keamanan sistem Berita SP PLN Kalbar.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold shrink-0">
              <ShieldCheck size={16} className="text-amber-700" />
              <span>Sesi Administrator</span>
            </div>
          </div>

          {passwordError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gagal Mengubah Password</span>
                <span>{passwordError}</span>
              </div>
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Berhasil!</span>
                <span>{passwordSuccess} Sesi administrator Anda telah diatur ulang, mengarahkan ke halaman login...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-5">
            {/* Password Saat Ini */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Password Saat Ini <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  disabled={isChangingPassword}
                  placeholder="Masukkan password saat ini"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120] focus:border-transparent transition-all placeholder:text-stone-400 disabled:bg-stone-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  title={showCurrentPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Baru */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Password Baru <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Key size={16} />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  disabled={isChangingPassword}
                  placeholder="Masukkan password baru (minimal 10 karakter)"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120] focus:border-transparent transition-all placeholder:text-stone-400 disabled:bg-stone-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  title={showNewPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Indikator Kekuatan Password Visual */}
              {newPassword.length > 0 && (
                <div className="mt-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-stone-600">Kekuatan Password:</span>
                    <span className={
                      passwordScore <= 2 ? 'text-red-600 font-extrabold' :
                      passwordScore <= 4 ? 'text-amber-600 font-extrabold' :
                      'text-emerald-600 font-extrabold'
                    }>
                      {passwordScore <= 1 && 'Sangat Lemah'}
                      {passwordScore === 2 && 'Lemah'}
                      {passwordScore === 3 && 'Sedang'}
                      {passwordScore === 4 && 'Kuat'}
                      {passwordScore === 5 && 'Sangat Kuat'}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden flex gap-1 p-0.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordScore
                            ? passwordScore <= 2
                              ? 'bg-red-500'
                              : passwordScore <= 4
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Checklist Persyaratan Keamanan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? 'text-emerald-700 font-semibold' : 'text-stone-500'}`}>
                      {passwordCriteria.minLength ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <XCircle size={14} className="text-stone-400 shrink-0" />}
                      <span>Minimal 10 Karakter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? 'text-emerald-700 font-semibold' : 'text-stone-500'}`}>
                      {passwordCriteria.hasUpper ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <XCircle size={14} className="text-stone-400 shrink-0" />}
                      <span>Huruf Besar (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLower ? 'text-emerald-700 font-semibold' : 'text-stone-500'}`}>
                      {passwordCriteria.hasLower ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <XCircle size={14} className="text-stone-400 shrink-0" />}
                      <span>Huruf Kecil (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-700 font-semibold' : 'text-stone-500'}`}>
                      {passwordCriteria.hasNumber ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <XCircle size={14} className="text-stone-400 shrink-0" />}
                      <span>Angka (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-stone-500'}`}>
                      {passwordCriteria.hasSpecial ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <XCircle size={14} className="text-stone-400 shrink-0" />}
                      <span>Karakter Khusus (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Konfirmasi Password Baru */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Konfirmasi Password Baru <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  disabled={isChangingPassword}
                  placeholder="Ulangi password baru"
                  className={`w-full pl-10 pr-11 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-stone-400 disabled:bg-stone-50 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-400 focus:ring-red-500 bg-red-50/30'
                      : 'border-stone-300 focus:ring-[#860120]'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                  <XCircle size={13} />
                  <span>Konfirmasi password tidak cocok.</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword || (confirmPassword !== '' && confirmPassword !== newPassword)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-[#860120] hover:bg-red-800 active:bg-red-900 text-white font-bold text-sm tracking-wide shadow-md shadow-red-900/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                <span>SIMPAN PASSWORD</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
