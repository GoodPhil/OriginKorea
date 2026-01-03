'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Share2,
  Users,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface CommunityEvent {
  id: string;
  title_ko: string;
  title_en: string;
  description_ko: string | null;
  description_en: string | null;
  event_date: string;
  event_time: string | null;
  status: 'upcoming' | 'completed' | 'cancelled';
  event_type: string;
  thumbnail_url: string | null;
  images: string[];
  location_ko: string | null;
  location_en: string | null;
  external_link: string | null;
  is_featured: boolean;
  view_count: number;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const texts = {
    ko: {
      loading: '이벤트 정보를 불러오는 중...',
      error: '이벤트를 불러올 수 없습니다.',
      back: '이벤트 목록',
      upcoming: '예정됨',
      completed: '완료됨',
      cancelled: '취소됨',
      location: '장소',
      date: '날짜',
      time: '시간',
      views: '조회수',
      share: '공유',
      copied: '복사됨!',
      register: '참가 신청',
      gallery: '갤러리',
      description: '이벤트 상세',
      featured: '주목',
      relatedInfo: '관련 정보',
      eventType: '유형',
    },
    en: {
      loading: 'Loading event details...',
      error: 'Failed to load event.',
      back: 'All Events',
      upcoming: 'Upcoming',
      completed: 'Completed',
      cancelled: 'Cancelled',
      location: 'Location',
      date: 'Date',
      time: 'Time',
      views: 'Views',
      share: 'Share',
      copied: 'Copied!',
      register: 'Register',
      gallery: 'Gallery',
      description: 'Event Details',
      featured: 'Featured',
      relatedInfo: 'Related Info',
      eventType: 'Type',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEvent(data.event);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id, t.error]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'ko') {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            {t.upcoming}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
            <Check className="h-3 w-3 mr-1" />
            {t.completed}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-500">
            <X className="h-3 w-3 mr-1" />
            {t.cancelled}
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share && event) {
      try {
        await navigator.share({
          title: language === 'ko' ? event.title_ko : event.title_en,
          url,
        });
      } catch (err) {
        // User cancelled or error - fallback to copy
        await copyToClipboard(url);
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const nextImage = () => {
    if (event?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-destructive font-medium">{error || t.error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const allImages = event.images?.length > 0 ? event.images : (event.thumbnail_url ? [event.thumbnail_url] : []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
        {/* Back Button */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {t.back}
        </Link>

        {/* Hero Section with Image */}
        <div className="relative mb-8">
          {/* Hero Image */}
          {allImages.length > 0 && (
            <div
              className="relative aspect-[21/9] rounded-2xl overflow-hidden cursor-pointer group shadow-2xl"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={allImages[0]}
                alt={language === 'ko' ? event.title_ko : event.title_en}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Featured badge */}
              {event.is_featured && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground shadow-lg">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t.featured}
                  </Badge>
                </div>
              )}

              {/* Status badge on image */}
              <div className="absolute top-4 right-4">
                {getStatusBadge(event.status)}
              </div>

              {/* Title overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    {event.event_type}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {language === 'ko' ? event.title_ko : event.title_en}
                </h1>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.event_date)}
                  </span>
                  {event.event_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.event_time}
                    </span>
                  )}
                </div>
              </div>

              {/* Click to expand hint */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  {language === 'ko' ? '클릭하여 확대' : 'Click to enlarge'}
                </span>
              </div>
            </div>
          )}

          {/* No image fallback */}
          {allImages.length === 0 && (
            <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl p-8 sm:p-12 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                {getStatusBadge(event.status)}
                <Badge variant="outline">{event.event_type}</Badge>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-4">
                {language === 'ko' ? event.title_ko : event.title_en}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.event_date)}
                </span>
                {event.event_time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {event.event_time}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {(event.description_ko || event.description_en) && (
              <Card className="bg-card border-border/60 overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="h-5 w-1 bg-primary rounded-full" />
                    {t.description}
                  </h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {language === 'ko' ? event.description_ko : event.description_en}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Gallery */}
            {allImages.length > 1 && (
              <Card className="bg-card border-border/60 overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="h-5 w-1 bg-primary rounded-full" />
                    {t.gallery}
                    <Badge variant="secondary" className="ml-2">{allImages.length}</Badge>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group ring-2 ring-transparent hover:ring-primary/50 transition-all"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        <Image
                          src={image}
                          alt={`${language === 'ko' ? event.title_ko : event.title_en} - ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card className="bg-card border-border/60 overflow-hidden sticky top-24">
              <CardContent className="p-6 space-y-4">
                {/* Date & Time */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.date}</p>
                      <p className="font-medium">{formatDate(event.event_date)}</p>
                    </div>
                  </div>

                  {event.event_time && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.time}</p>
                        <p className="font-medium">{event.event_time}</p>
                      </div>
                    </div>
                  )}

                  {(event.location_ko || event.location_en) && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.location}</p>
                        <p className="font-medium">
                          {language === 'ko' ? event.location_ko : event.location_en}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.views}</p>
                      <p className="font-medium">{event.view_count.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  {event.external_link && (
                    <a href={event.external_link} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full" size="lg">
                        <Users className="h-4 w-4 mr-2" />
                        {t.register}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleShare}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        {t.share}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm">
          <button
            type="button"
            className="absolute top-4 right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>

          {allImages.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
                onClick={prevImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                className="absolute right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="relative w-full max-w-6xl h-[85vh] mx-4">
            <Image
              src={allImages[currentImageIndex]}
              alt={`${language === 'ko' ? event.title_ko : event.title_en} - ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-6'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
