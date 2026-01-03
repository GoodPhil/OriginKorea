-- =============================================
-- Community Events 테이블 스키마
-- Origin Korea 커뮤니티 이벤트 관리
-- =============================================

-- 1. 이벤트 테이블 생성
CREATE TABLE IF NOT EXISTS community_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 기본 정보
  title_ko VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  description_ko TEXT,
  description_en TEXT,

  -- 날짜 및 상태
  event_date DATE NOT NULL,
  event_time VARCHAR(50), -- 예: "14:00 - 16:00"
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  event_type VARCHAR(50) DEFAULT 'Workshop', -- Workshop, Meetup, Online, Conference 등

  -- 이미지
  thumbnail_url TEXT, -- 목록에 표시될 썸네일 (1장)
  images TEXT[] DEFAULT '{}', -- 상세 페이지 이미지들 (여러 장)

  -- 추가 정보
  location_ko VARCHAR(200),
  location_en VARCHAR(200),
  external_link TEXT, -- 외부 링크 (등록 페이지 등)

  -- 관리
  is_featured BOOLEAN DEFAULT false, -- 메인에 표시
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,

  -- 작성자
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_community_events_status ON community_events(status);
CREATE INDEX IF NOT EXISTS idx_community_events_event_date ON community_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_community_events_is_active ON community_events(is_active);
CREATE INDEX IF NOT EXISTS idx_community_events_is_featured ON community_events(is_featured);

-- 3. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_community_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_community_events_updated_at ON community_events;
CREATE TRIGGER trigger_community_events_updated_at
  BEFORE UPDATE ON community_events
  FOR EACH ROW
  EXECUTE FUNCTION update_community_events_updated_at();

-- 4. RLS (Row Level Security) 정책
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성화된 이벤트 조회 가능
CREATE POLICY "Anyone can view active events"
  ON community_events
  FOR SELECT
  USING (is_active = true);

-- 관리자만 이벤트 생성 가능
CREATE POLICY "Admins can create events"
  ON community_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 관리자만 이벤트 수정 가능
CREATE POLICY "Admins can update events"
  ON community_events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 관리자만 이벤트 삭제 가능
CREATE POLICY "Admins can delete events"
  ON community_events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 5. 샘플 데이터 삽입
INSERT INTO community_events (
  title_ko, title_en, description_ko, description_en,
  event_date, event_time, status, event_type,
  thumbnail_url, images,
  location_ko, location_en, is_featured
) VALUES
(
  'Origin Korea 온보딩 워크샵',
  'Origin Korea Onboarding Workshop',
  'Origin Korea에 처음 참여하시는 분들을 위한 온보딩 워크샵입니다. LGNS 토큰의 기본 개념부터 스테이킹 방법까지 상세히 안내해 드립니다.',
  'An onboarding workshop for those new to Origin Korea. We will guide you through the basics of LGNS tokens to staking methods.',
  '2025-02-15',
  '14:00 - 16:00',
  'upcoming',
  'Workshop',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  ARRAY['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200'],
  '서울 강남구',
  'Gangnam, Seoul',
  true
),
(
  'LGNS 스테이킹 전략 워크샵',
  'LGNS Staking Strategy Workshop',
  '효율적인 LGNS 스테이킹 전략을 배우는 심화 워크샵입니다. 복리 효과 극대화 방법과 리스크 관리 전략을 다룹니다.',
  'An advanced workshop to learn efficient LGNS staking strategies. Covers compound effect maximization and risk management.',
  '2025-01-25',
  '15:00 - 17:00',
  'upcoming',
  'Workshop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
  ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'],
  '온라인 (Zoom)',
  'Online (Zoom)',
  true
),
(
  'DAO 거버넌스 워크샵',
  'DAO Governance Workshop',
  'Origin DAO의 거버넌스 참여 방법과 투표 시스템을 배우는 워크샵입니다.',
  'A workshop to learn about Origin DAO governance participation and voting system.',
  '2024-12-28',
  '14:00 - 16:00',
  'completed',
  'Workshop',
  'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
  ARRAY['https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200'],
  '서울 강남구',
  'Gangnam, Seoul',
  false
);

-- 6. 뷰 카운트 증가 함수
CREATE OR REPLACE FUNCTION increment_event_view_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_events
  SET view_count = view_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
