import { NextResponse } from 'next/server';

// Cache the exchange rate for 1 hour to avoid too many API calls
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET() {
  try {
    // Check if we have a cached rate that's still valid
    if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        rate: cachedRate.rate,
        cached: true,
        timestamp: cachedRate.timestamp,
      });
    }

    // Fetch from Exchange Rate API (free tier)
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    const krwRate = data.rates?.KRW;

    if (!krwRate) {
      throw new Error('KRW rate not found');
    }

    // Update cache
    cachedRate = {
      rate: krwRate,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      rate: krwRate,
      cached: false,
      timestamp: Date.now(),
      source: 'exchangerate-api.com',
    });
  } catch (error) {
    console.error('Exchange rate API error:', error);

    // Return a fallback rate if API fails
    const fallbackRate = 1450;
    return NextResponse.json({
      rate: fallbackRate,
      cached: false,
      fallback: true,
      timestamp: Date.now(),
    });
  }
}
