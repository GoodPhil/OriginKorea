import { NextResponse } from 'next/server';

// Default contract addresses
const DEFAULT_CONTRACTS = [
  { key: 'lgnsToken', name: 'LGNS Token', address: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01', description: 'LGNS 토큰 컨트랙트' },
  { key: 'staking', name: 'Staking', address: '0x1964Ca90474b11FFD08af387b110ba6C96251Bfc', description: '스테이킹 컨트랙트 (sLGNS)' },
  { key: 'treasury', name: 'Treasury', address: '0x7B9B7d4F870A38e92c9a181B00f9b33cc8Ef5321', description: '트레저리 컨트랙트' },
  { key: 'turbine', name: 'Turbine (Bond)', address: '0x07Ff4e06865de4934409Aa6eCea503b08Cc1C78d', description: '본드/터빈 컨트랙트' },
  { key: 'lp', name: 'QuickSwap LP', address: '0x882df4b0fb50a229c3b4124eb18c759911485bfb', description: 'LGNS/USDC 유동성 풀' },
];

// In-memory storage (in production, use database)
let stakingSettings = {
  contracts: DEFAULT_CONTRACTS,
  manualData: {
    treasury: {
      enabled: false,
      balance: 0,
      balanceUSD: 0,
      backingRatio: null as number | null,
    },
    bond: {
      enabled: false,
      bondPrice: null as number | null,
      discount: null as number | null,
      totalDebt: null as number | null,
    },
    liquidity: {
      enabled: false,
      lgnsReserve: null as number | null,
      usdcReserve: null as number | null,
      totalLiquidityUSD: null as number | null,
      priceFromLP: null as number | null,
    },
    yields: {
      enabled: false,
      per8Hours: 0.2,
      daily: 0.6,
      weekly: 4.2,
      monthly: 18,
      estimatedAPY: '866.46',
    },
  },
  lastUpdated: new Date().toISOString(),
};

// Load from localStorage-like persistence (file-based for simplicity)
import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), '.same', 'staking-settings.json');

async function loadSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    stakingSettings = JSON.parse(data);
  } catch {
    // File doesn't exist, use defaults
  }
}

async function saveSettings() {
  try {
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(stakingSettings, null, 2));
  } catch (error) {
    console.error('Failed to save staking settings:', error);
  }
}

// Initialize settings on first load
loadSettings();

export async function GET() {
  await loadSettings();
  return NextResponse.json({
    success: true,
    ...stakingSettings,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Update contracts if provided
    if (body.contracts) {
      stakingSettings.contracts = body.contracts;
    }

    // Update manual data if provided
    if (body.manualData) {
      stakingSettings.manualData = {
        ...stakingSettings.manualData,
        ...body.manualData,
      };
    }

    stakingSettings.lastUpdated = new Date().toISOString();

    await saveSettings();

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      ...stakingSettings,
    });
  } catch (error) {
    console.error('Failed to update staking settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
