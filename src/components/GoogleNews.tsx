import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, ExternalLink } from 'lucide-react';

interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
}

interface GoogleNewsProps {
  topic: 'NATION' | 'WORLD';
}

export default function GoogleNews({ topic }: GoogleNewsProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isInitial = true;
    const fetchNews = async () => {
      if (isInitial) setLoading(true);
      try {
        const timestamp = new Date().getTime(); // to avoid aggressive caching
        const rssUrl = encodeURIComponent(`https://news.google.com/rss/headlines/section/topic/${topic}?hl=id&gl=ID&ceid=ID:id&_t=${timestamp}`);
        // rss2json public API
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&api_key=`);
        const data = await response.json();
        
        if (data.status === 'ok' && Array.isArray(data.items)) {
          setNews(data.items.slice(0, 24)); // Get top 24 news
        }
      } catch (error) {
        console.error('Failed to fetch news', error);
      } finally {
        if (isInitial) setLoading(false);
        isInitial = false;
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60000); // Fetch every minute

    return () => clearInterval(interval);
  }, [topic]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Kemarin';
    return date.toLocaleDateString('id-ID');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/20 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 h-40 flex flex-col">
            <div className="w-3/4 h-5 bg-white/30 rounded mb-4"></div>
            <div className="w-full h-4 bg-white/30 rounded mb-2"></div>
            <div className="w-1/2 h-4 bg-white/30 rounded mt-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
      {news.map((item, index) => {
        const titleParts = item.title.split(' - ');
        const sourceName = titleParts.length > 1 ? titleParts.pop() : (item.author || 'Google News');
        const cleanTitle = titleParts.join(' - ') || item.title;

        return (
          <motion.a
            key={item.guid}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-white/20 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgb(0,0,0,0.1)] border border-white/20 transition-all duration-300 hover:-translate-y-1 relative h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <span className="text-blue-700 truncate max-w-[150px]">{sourceName}</span>
                <span className="text-gray-300">&bull;</span>
                <span className="flex items-center"><Clock size={12} className="mr-1" /> {getRelativeTime(item.pubDate)}</span>
              </div>
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors duration-300">
                <ExternalLink size={16} />
              </div>
            </div>
            
            <h3 className="font-serif text-lg md:text-xl font-bold leading-snug text-gray-900 group-hover:text-blue-900 transition-colors duration-300 mb-0">
              {cleanTitle}
            </h3>
          </motion.a>
        );
      })}
    </div>
  );
}
