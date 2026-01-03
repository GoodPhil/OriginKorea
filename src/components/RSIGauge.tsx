'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RSIGaugeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function RSIGauge({ value, size = 'md', showLabels = true }: RSIGaugeProps) {
  const { language } = useLanguage();

  // Clamp RSI value between 0 and 100
  const rsiValue = Math.max(0, Math.min(100, value));

  // Determine zone and color
  const zone = useMemo(() => {
    if (rsiValue >= 70) return 'overbought';
    if (rsiValue <= 30) return 'oversold';
    return 'neutral';
  }, [rsiValue]);

  const colors = useMemo(() => {
    switch (zone) {
      case 'overbought':
        return {
          needle: '#ef4444',
          text: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
        };
      case 'oversold':
        return {
          needle: '#22c55e',
          text: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
        };
      default:
        return {
          needle: '#eab308',
          text: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
        };
    }
  }, [zone]);

  const texts = {
    ko: {
      overbought: '과매수',
      oversold: '과매도',
      neutral: '중립',
      overboughtDesc: '매도 신호 - 가격 조정 가능성',
      oversoldDesc: '매수 신호 - 반등 가능성',
      neutralDesc: '관망 - 추세 확인 필요',
      rsi: 'RSI 지표',
    },
    en: {
      overbought: 'Overbought',
      oversold: 'Oversold',
      neutral: 'Neutral',
      overboughtDesc: 'Sell signal - Possible correction',
      oversoldDesc: 'Buy signal - Possible rebound',
      neutralDesc: 'Hold - Trend confirmation needed',
      rsi: 'RSI Indicator',
    },
  };

  const t = texts[language];

  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 70, fontSize: 16, labelSize: 8 },
    md: { width: 180, height: 100, fontSize: 24, labelSize: 10 },
    lg: { width: 240, height: 130, fontSize: 32, labelSize: 12 },
  };

  const config = sizeConfig[size];
  const centerX = config.width / 2;
  const centerY = config.height - 10;
  const radius = config.width / 2 - 20;

  // Calculate needle angle (0 = left, 180 = right)
  // RSI 0 = -90deg (left), RSI 100 = 90deg (right)
  const needleAngle = ((rsiValue / 100) * 180) - 90;
  const needleLength = radius - 10;

  // Calculate needle end point
  const needleX = centerX + needleLength * Math.cos((needleAngle * Math.PI) / 180);
  const needleY = centerY + needleLength * Math.sin((needleAngle * Math.PI) / 180);

  // Arc path helper
  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const start = {
      x: x + r * Math.cos((startAngle * Math.PI) / 180),
      y: y + r * Math.sin((startAngle * Math.PI) / 180),
    };
    const end = {
      x: x + r * Math.cos((endAngle * Math.PI) / 180),
      y: y + r * Math.sin((endAngle * Math.PI) / 180),
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  return (
    <div className={`flex flex-col items-center ${colors.bg} ${colors.border} border rounded-xl p-4`}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={describeArc(centerX, centerY, radius, -180, 0)}
          fill="none"
          stroke="#374151"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Oversold zone (0-30) - Green */}
        <path
          d={describeArc(centerX, centerY, radius, -180, -180 + (30 / 100) * 180)}
          fill="none"
          stroke="#22c55e"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Neutral zone (30-70) - Yellow */}
        <path
          d={describeArc(centerX, centerY, radius, -180 + (30 / 100) * 180, -180 + (70 / 100) * 180)}
          fill="none"
          stroke="#eab308"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Overbought zone (70-100) - Red */}
        <path
          d={describeArc(centerX, centerY, radius, -180 + (70 / 100) * 180, 0)}
          fill="none"
          stroke="#ef4444"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Zone labels */}
        {showLabels && (
          <>
            <text
              x={centerX - radius + 5}
              y={centerY - 5}
              fontSize={config.labelSize}
              fill="#22c55e"
              textAnchor="start"
              className="font-medium"
            >
              0
            </text>
            <text
              x={centerX - radius * 0.5}
              y={centerY - radius * 0.85}
              fontSize={config.labelSize}
              fill="#22c55e"
              textAnchor="middle"
              className="font-medium"
            >
              30
            </text>
            <text
              x={centerX + radius * 0.5}
              y={centerY - radius * 0.85}
              fontSize={config.labelSize}
              fill="#ef4444"
              textAnchor="middle"
              className="font-medium"
            >
              70
            </text>
            <text
              x={centerX + radius - 5}
              y={centerY - 5}
              fontSize={config.labelSize}
              fill="#ef4444"
              textAnchor="end"
              className="font-medium"
            >
              100
            </text>
          </>
        )}

        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke={colors.needle}
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r="6"
          fill={colors.needle}
          className="transition-colors duration-500"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="3"
          fill="#1f2937"
        />

        {/* RSI Value */}
        <text
          x={centerX}
          y={centerY - radius * 0.3}
          fontSize={config.fontSize}
          fill="currentColor"
          textAnchor="middle"
          className={`font-bold ${colors.text}`}
        >
          {rsiValue.toFixed(1)}
        </text>
      </svg>

      {/* Zone indicator */}
      <div className="mt-2 text-center">
        <div className={`text-sm font-bold ${colors.text}`}>
          {t[zone]}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {zone === 'overbought' && t.overboughtDesc}
          {zone === 'oversold' && t.oversoldDesc}
          {zone === 'neutral' && t.neutralDesc}
        </div>
      </div>
    </div>
  );
}

// Compact inline RSI indicator for cards
export function RSIBadge({ value }: { value: number }) {
  const rsiValue = Math.max(0, Math.min(100, value));

  const getColor = () => {
    if (rsiValue >= 70) return 'bg-red-500/20 text-red-500 border-red-500/30';
    if (rsiValue <= 30) return 'bg-green-500/20 text-green-500 border-green-500/30';
    return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${getColor()}`}>
      <div className="relative w-8 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all ${
            rsiValue >= 70 ? 'bg-red-500' : rsiValue <= 30 ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${rsiValue}%` }}
        />
      </div>
      <span className="text-xs font-bold">{rsiValue.toFixed(0)}</span>
    </div>
  );
}
