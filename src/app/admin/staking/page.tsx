'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Database,
  Shield,
  Banknote,
  Droplets,
  TrendingUp,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Contract {
  key: string;
  name: string;
  address: string;
  description: string;
}

interface ManualData {
  treasury: {
    enabled: boolean;
    balance: number;
    balanceUSD: number;
    backingRatio: number | null;
  };
  bond: {
    enabled: boolean;
    bondPrice: number | null;
    discount: number | null;
    totalDebt: number | null;
  };
  liquidity: {
    enabled: boolean;
    lgnsReserve: number | null;
    usdcReserve: number | null;
    totalLiquidityUSD: number | null;
    priceFromLP: number | null;
  };
  yields: {
    enabled: boolean;
    per8Hours: number;
    daily: number;
    weekly: number;
    monthly: number;
    estimatedAPY: string;
  };
}

interface StakingSettings {
  contracts: Contract[];
  manualData: ManualData;
  lastUpdated: string;
}

export default function AdminStakingPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();

  const [settings, setSettings] = useState<StakingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New contract form
  const [newContract, setNewContract] = useState({ key: '', name: '', address: '', description: '' });
  const [editingContract, setEditingContract] = useState<string | null>(null);

  const texts = {
    ko: {
      title: '스테이킹 설정',
      subtitle: '컨트랙트 주소 및 수동 데이터 관리',
      back: '관리자 홈',
      contracts: '컨트랙트 주소',
      contractsDesc: '블록체인 컨트랙트 주소를 관리합니다',
      treasuryData: '트레저리 데이터',
      treasuryDesc: '트레저리 잔액 및 백킹 비율을 수동으로 설정',
      bondData: '본드 데이터',
      bondDesc: '본드 가격 및 할인율을 수동으로 설정',
      liquidityData: '유동성 풀 데이터',
      liquidityDesc: 'LP 리저브 및 유동성을 수동으로 설정',
      yieldsData: '수익률 데이터',
      yieldsDesc: '스테이킹 수익률을 수동으로 설정',
      enableManual: '수동 입력 사용',
      save: '저장',
      saving: '저장 중...',
      saved: '저장되었습니다',
      error: '저장 실패',
      addContract: '컨트랙트 추가',
      key: '키',
      name: '이름',
      address: '주소',
      description: '설명',
      balance: '잔액',
      balanceUSD: 'USD 가치',
      backingRatio: '백킹 비율 (%)',
      bondPrice: '본드 가격',
      discount: '할인율 (%)',
      totalDebt: '총 채무',
      lgnsReserve: 'LGNS 리저브',
      usdcReserve: 'USDC 리저브',
      totalLiquidity: '총 유동성 (USD)',
      priceFromLP: 'LP 가격',
      per8Hours: '8시간당 (%)',
      daily: '일일 (%)',
      weekly: '주간 (%)',
      monthly: '월간 (%)',
      estimatedAPY: '연간 APY (%)',
      lastUpdated: '마지막 업데이트',
      viewOnPolygonscan: 'Polygonscan에서 보기',
      delete: '삭제',
      edit: '편집',
      cancel: '취소',
    },
    en: {
      title: 'Staking Settings',
      subtitle: 'Manage contract addresses and manual data',
      back: 'Admin Home',
      contracts: 'Contract Addresses',
      contractsDesc: 'Manage blockchain contract addresses',
      treasuryData: 'Treasury Data',
      treasuryDesc: 'Manually set treasury balance and backing ratio',
      bondData: 'Bond Data',
      bondDesc: 'Manually set bond price and discount',
      liquidityData: 'Liquidity Pool Data',
      liquidityDesc: 'Manually set LP reserves and liquidity',
      yieldsData: 'Yield Data',
      yieldsDesc: 'Manually set staking yields',
      enableManual: 'Enable Manual Input',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved successfully',
      error: 'Failed to save',
      addContract: 'Add Contract',
      key: 'Key',
      name: 'Name',
      address: 'Address',
      description: 'Description',
      balance: 'Balance',
      balanceUSD: 'USD Value',
      backingRatio: 'Backing Ratio (%)',
      bondPrice: 'Bond Price',
      discount: 'Discount (%)',
      totalDebt: 'Total Debt',
      lgnsReserve: 'LGNS Reserve',
      usdcReserve: 'USDC Reserve',
      totalLiquidity: 'Total Liquidity (USD)',
      priceFromLP: 'LP Price',
      per8Hours: 'Per 8 Hours (%)',
      daily: 'Daily (%)',
      weekly: 'Weekly (%)',
      monthly: 'Monthly (%)',
      estimatedAPY: 'Annual APY (%)',
      lastUpdated: 'Last Updated',
      viewOnPolygonscan: 'View on Polygonscan',
      delete: 'Delete',
      edit: 'Edit',
      cancel: 'Cancel',
    },
  };

  const t = texts[language];

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staking-settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/staking-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contracts: settings.contracts,
          manualData: settings.manualData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSettings(data);
        setMessage({ type: 'success', text: t.saved });
      } else {
        setMessage({ type: 'error', text: t.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateContract = (index: number, field: keyof Contract, value: string) => {
    if (!settings) return;
    const newContracts = [...settings.contracts];
    newContracts[index] = { ...newContracts[index], [field]: value };
    setSettings({ ...settings, contracts: newContracts });
  };

  const addContract = () => {
    if (!settings || !newContract.key || !newContract.address) return;
    setSettings({
      ...settings,
      contracts: [...settings.contracts, { ...newContract }],
    });
    setNewContract({ key: '', name: '', address: '', description: '' });
  };

  const deleteContract = (index: number) => {
    if (!settings) return;
    const newContracts = settings.contracts.filter((_, i) => i !== index);
    setSettings({ ...settings, contracts: newContracts });
  };

  const updateManualData = (
    section: 'treasury' | 'bond' | 'liquidity' | 'yields',
    field: string,
    value: number | string | boolean | null
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      manualData: {
        ...settings.manualData,
        [section]: {
          ...settings.manualData[section],
          [field]: value,
        },
      },
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchSettings} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {language === 'ko' ? '새로고침' : 'Refresh'}
            </Button>
            <Button onClick={saveSettings} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? t.saving : t.save}
            </Button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className={`container mx-auto px-4 mt-4`}>
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6 space-y-6">
        {settings && (
          <>
            {/* Contract Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  {t.contracts}
                </CardTitle>
                <CardDescription>{t.contractsDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.contracts.map((contract, index) => (
                  <div key={contract.key} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{contract.key}</Badge>
                        <span className="font-medium">{contract.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://polygonscan.com/address/${contract.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-secondary"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteContract(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">{t.address}</label>
                        <Input
                          value={contract.address}
                          onChange={(e) => updateContract(index, 'address', e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">{t.description}</label>
                        <Input
                          value={contract.description}
                          onChange={(e) => updateContract(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Contract */}
                <div className="p-4 border-2 border-dashed border-border rounded-lg space-y-3">
                  <p className="text-sm font-medium">{t.addContract}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                      placeholder={t.key}
                      value={newContract.key}
                      onChange={(e) => setNewContract({ ...newContract, key: e.target.value })}
                    />
                    <Input
                      placeholder={t.name}
                      value={newContract.name}
                      onChange={(e) => setNewContract({ ...newContract, name: e.target.value })}
                    />
                    <Input
                      placeholder={t.address}
                      value={newContract.address}
                      onChange={(e) => setNewContract({ ...newContract, address: e.target.value })}
                      className="font-mono"
                    />
                    <Input
                      placeholder={t.description}
                      value={newContract.description}
                      onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={addContract} size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t.addContract}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Treasury Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      {t.treasuryData}
                    </CardTitle>
                    <CardDescription>{t.treasuryDesc}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.enableManual}</span>
                    <Switch
                      checked={settings.manualData.treasury.enabled}
                      onCheckedChange={(checked) => updateManualData('treasury', 'enabled', checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              {settings.manualData.treasury.enabled && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">{t.balance} (LGNS)</label>
                      <Input
                        type="number"
                        value={settings.manualData.treasury.balance || ''}
                        onChange={(e) => updateManualData('treasury', 'balance', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.balanceUSD}</label>
                      <Input
                        type="number"
                        value={settings.manualData.treasury.balanceUSD || ''}
                        onChange={(e) => updateManualData('treasury', 'balanceUSD', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.backingRatio}</label>
                      <Input
                        type="number"
                        value={settings.manualData.treasury.backingRatio || ''}
                        onChange={(e) => updateManualData('treasury', 'backingRatio', parseFloat(e.target.value) || null)}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Bond Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-purple-500" />
                      {t.bondData}
                    </CardTitle>
                    <CardDescription>{t.bondDesc}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.enableManual}</span>
                    <Switch
                      checked={settings.manualData.bond.enabled}
                      onCheckedChange={(checked) => updateManualData('bond', 'enabled', checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              {settings.manualData.bond.enabled && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">{t.bondPrice}</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={settings.manualData.bond.bondPrice || ''}
                        onChange={(e) => updateManualData('bond', 'bondPrice', parseFloat(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.discount}</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.manualData.bond.discount || ''}
                        onChange={(e) => updateManualData('bond', 'discount', parseFloat(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.totalDebt}</label>
                      <Input
                        type="number"
                        value={settings.manualData.bond.totalDebt || ''}
                        onChange={(e) => updateManualData('bond', 'totalDebt', parseFloat(e.target.value) || null)}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Liquidity Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-cyan-500" />
                      {t.liquidityData}
                    </CardTitle>
                    <CardDescription>{t.liquidityDesc}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.enableManual}</span>
                    <Switch
                      checked={settings.manualData.liquidity.enabled}
                      onCheckedChange={(checked) => updateManualData('liquidity', 'enabled', checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              {settings.manualData.liquidity.enabled && (
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">{t.lgnsReserve}</label>
                      <Input
                        type="number"
                        value={settings.manualData.liquidity.lgnsReserve || ''}
                        onChange={(e) => updateManualData('liquidity', 'lgnsReserve', parseFloat(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.usdcReserve}</label>
                      <Input
                        type="number"
                        value={settings.manualData.liquidity.usdcReserve || ''}
                        onChange={(e) => updateManualData('liquidity', 'usdcReserve', parseFloat(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.totalLiquidity}</label>
                      <Input
                        type="number"
                        value={settings.manualData.liquidity.totalLiquidityUSD || ''}
                        onChange={(e) => updateManualData('liquidity', 'totalLiquidityUSD', parseFloat(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.priceFromLP}</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={settings.manualData.liquidity.priceFromLP || ''}
                        onChange={(e) => updateManualData('liquidity', 'priceFromLP', parseFloat(e.target.value) || null)}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Yields Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      {t.yieldsData}
                    </CardTitle>
                    <CardDescription>{t.yieldsDesc}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.enableManual}</span>
                    <Switch
                      checked={settings.manualData.yields.enabled}
                      onCheckedChange={(checked) => updateManualData('yields', 'enabled', checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              {settings.manualData.yields.enabled && (
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">{t.per8Hours}</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.manualData.yields.per8Hours}
                        onChange={(e) => updateManualData('yields', 'per8Hours', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.daily}</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.manualData.yields.daily}
                        onChange={(e) => updateManualData('yields', 'daily', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.weekly}</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.manualData.yields.weekly}
                        onChange={(e) => updateManualData('yields', 'weekly', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.monthly}</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.manualData.yields.monthly}
                        onChange={(e) => updateManualData('yields', 'monthly', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t.estimatedAPY}</label>
                      <Input
                        value={settings.manualData.yields.estimatedAPY}
                        onChange={(e) => updateManualData('yields', 'estimatedAPY', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Last Updated */}
            <div className="text-center text-sm text-muted-foreground">
              {t.lastUpdated}: {new Date(settings.lastUpdated).toLocaleString()}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
