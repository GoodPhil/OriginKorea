'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, MapPin, Clock, ArrowRight, Users, RefreshCw } from 'lucide-react';

interface CommunityEvent {
  id: string;
  title_ko: string;
  title_en: string;
  description_ko: string;
  description_en: string;
  event_date: string;
  event_time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  event_type: string;
  thumbnail_url: string;
  location_ko: string;
  location_en: string;
  is_featured: boolean;
}

// Sample events data (fallback when Supabase is not configured)
const sampleEvents: CommunityEvent[] = [
  {
    id: '1',
    title_ko: 'Origin 온보딩 워크샵',
    title_en: 'Origin Onboarding Workshop',
    description_ko: 'Origin에 처음 참여하시는 분들을 위한 온보딩 워크샵입니다.',
    description_en: 'An onboarding workshop for those new to Origin.',
    event_date: '2025-02-15',
    event_time: '14:00 - 16:00',
    status: 'upcoming',
    event_type: 'Workshop',
    thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    location_ko: '서울 강남구',
    location_en: 'Gangnam, Seoul',
    is_featured: true,
  },
  {
    id: '2',
    title_ko: 'LGNS 스테이킹 전략 워크샵',
    title_en: 'LGNS Staking Strategy Workshop',
    description_ko: '효율적인 LGNS 스테이킹 전략을 배우는 심화 워크샵입니다.',
    description_en: 'An advanced workshop to learn efficient LGNS staking strategies.',
    event_date: '2025-01-25',
    event_time: '15:00 - 17:00',
    status: 'upcoming',
    event_type: 'Workshop',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    location_ko: '온라인 (Zoom)',
    location_en: 'Online (Zoom)',
    is_featured: true,
  },
  {
    id: '3',
    title_ko: '커뮤니티 밋업',
    title_en: 'Community Meetup',
    description_ko: 'Origin 커뮤니티 오프라인 밋업 행사입니다.',
    description_en: 'Origin community offline meetup event.',
    event_date: '2024-12-28',
    event_time: '14:00 - 16:00',
    status: 'completed',
    event_type: 'Meetup',
    thumbnail_url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
    location_ko: '서울 강남구',
    location_en: 'Gangnam, Seoul',
    is_featured: false,
  },
];

export default function EventsPage() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'sample'>('sample');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();

        if (data.events && data.events.length > 0) {
          setEvents(data.events);
          setDataSource('supabase');
        } else {
          // Fallback to sample data
          setEvents(sampleEvents);
          setDataSource('sample');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to sample data
        setEvents(sampleEvents);
        setDataSource('sample');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">{language === 'ko' ? '예정' : 'Upcoming'}</Badge>;
      case 'completed':
        return <Badge variant="secondary">{language === 'ko' ? '완료' : 'Completed'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{language === 'ko' ? '취소' : 'Cancelled'}</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ko' ? '커뮤니티 이벤트' : 'Community Events'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ko'
              ? 'Origin 커뮤니티 이벤트와 워크샵에 참여하세요.'
              : 'Join Origin community events and workshops.'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {loading && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <RefreshCw className="animate-spin h-4 w-4" />
                {language === 'ko' ? '이벤트 불러오는 중...' : 'Loading events...'}
              </span>
            )}
            {!loading && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                {language === 'ko'
                  ? dataSource === 'supabase'
                    ? '실시간 데이터'
                    : '샘플 데이터'
                  : dataSource === 'supabase'
                    ? 'Live data'
                    : 'Sample data'}
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            disabled={loading}
          >
            {language === 'ko' ? '전체' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            disabled={loading}
          >
            {language === 'ko' ? '예정된 이벤트' : 'Upcoming'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            disabled={loading}
          >
            {language === 'ko' ? '완료된 이벤트' : 'Completed'}
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-48 bg-secondary">
                  <img
                    src={event.thumbnail_url}
                    alt={language === 'ko' ? event.title_ko : event.title_en}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {getStatusBadge(event.status)}
                    {event.is_featured && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {language === 'ko' ? '추천' : 'Featured'}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                      {event.event_type}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ko' ? event.title_ko : event.title_en}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {language === 'ko' ? event.description_ko : event.description_en}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{event.event_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{language === 'ko' ? event.location_ko : event.location_en}</span>
                  </div>

                  <Link
                    href={`/community/events/${event.id}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium mt-2"
                  >
                    {language === 'ko' ? '자세히 보기' : 'View Details'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
        </div>

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === 'ko' ? '이벤트가 없습니다.' : 'No events found.'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
