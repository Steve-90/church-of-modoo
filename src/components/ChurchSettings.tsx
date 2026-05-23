/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect, FormEvent } from 'react';
import { ChurchConfig, Member, Offering, Prayer, Visitation, Bulletin } from '../types';
import { 
  Save, Sparkles, Image, Check, RefreshCw, Database, Link, Terminal, 
  Cloud, Upload, Download, AlertCircle, Eye, EyeOff, Copy, Info 
} from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials } from '../lib/supabaseClient';
import { testSupabaseConnection, pushAllToSupabase, pullFromSupabase, SUPABASE_SQL_SCHEMA } from '../lib/supabaseSync';

interface ChurchSettingsProps {
  config: ChurchConfig;
  onUpdateConfig: (config: ChurchConfig) => void;
  members: Member[];
  offerings: Offering[];
  prayers: Prayer[];
  visitations: Visitation[];
  bulletin: Bulletin;
  onImportSyncedData: (data: {
    members: Member[];
    offerings: Offering[];
    prayers: Prayer[];
    visitations: Visitation[];
    bulletin: Bulletin;
    config: ChurchConfig;
  }) => void;
}

const PRESET_EMOJIS = ['✞', '⛪', '✦', '🌟', '📖', '🕊️', '❤️', '🔥', '🛡️', '☘️'];

export default function ChurchSettings({ 
  config, 
  onUpdateConfig,
  members,
  offerings,
  prayers,
  visitations,
  bulletin,
  onImportSyncedData
}: ChurchSettingsProps) {
  // 1. Identity & Branding states
  const [name, setName] = useState(config.name);
  const [denomination, setDenomination] = useState(config.denomination);
  const [logoType, setLogoType] = useState<'emoji' | 'url'>(config.logoType);
  const [logoValue, setLogoValue] = useState(config.logoValue);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 2. Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [liveSync, setLiveSync] = useState(false);
  const [testStatus, setTestStatus] = useState<null | 'checking' | 'connected' | 'error'>(null);
  const [testMsg, setTestMsg] = useState('');
  const [syncStatus, setSyncStatus] = useState<null | 'pushing' | 'pulling' | 'success' | 'error'>(null);
  const [syncMsg, setSyncMsg] = useState('');
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load initial settings
  useEffect(() => {
    setName(config.name);
    setDenomination(config.denomination);
    setLogoType(config.logoType);
    setLogoValue(config.logoValue);
    
    // Load Supabase credentials
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseKey(creds.anonKey);
    setLiveSync(localStorage.getItem('SUPABASE_LIVE_SYNC') === 'true');
  }, [config]);

  // Save Identity configuration
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      name: name.trim() || '은혜교회',
      denomination: denomination.trim(),
      logoType,
      logoValue: logoValue.trim() || '✞'
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm('모든 설정값을 시스템 기본값(은혜교회)으로 초기화하시겠습니까?')) {
      setName('은혜교회');
      setDenomination('대한예수교장로회');
      setLogoType('emoji');
      setLogoValue('✞');
    }
  };

  // 3. Supabase Event Actions
  const handleSaveCredentials = () => {
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    
    // Explicitly re-init client and trigger instance refresh
    import('../lib/supabaseClient').then(({ initSupabase }) => {
      initSupabase(supabaseUrl.trim(), supabaseKey.trim());
    });
    
    setTestStatus(null);
    setTestMsg('');
    alert('🔐 Supabase 데이터베이스 연결 정보가 브라우저 서약 저장소에 입력되었습니다. 하단 연결 테스트 버튼으로 통신율을 확인하십시오!');
  };

  const handleTestConnection = async () => {
    setTestStatus('checking');
    setTestMsg('서버 릴레이 노드와 원격 대조 테스트 요청 중...');
    
    // Apply key settings to memory client instantly before testing
    const { initSupabase } = await import('../lib/supabaseClient');
    initSupabase(supabaseUrl.trim(), supabaseKey.trim());

    const res = await testSupabaseConnection();
    if (res.success) {
      setTestStatus('connected');
      setTestMsg(res.message);
    } else {
      setTestStatus('error');
      setTestMsg(res.message);
    }
  };

  const handleToggleLiveSync = (checked: boolean) => {
    if (checked && (!supabaseUrl || !supabaseKey)) {
      alert('⚠️ 실시간 연동을 활성화하기 전에 먼저 Supabase 프로젝트의 URL과 Key 주소를 작성하고 저장해 주십시오.');
      return;
    }
    setLiveSync(checked);
    localStorage.setItem('SUPABASE_LIVE_SYNC', String(checked));
    
    if (checked) {
      alert('⚡ 실시간 데이터 동기화 모드가 켜졌습니다! 지금부터 교원 추가/수정, 헌금 영출, 심방 대기열 작동 시 실시간으로 클라우드 서버에 데이터가 백업됩니다.');
    } else {
      alert('실시간 동기화 모드가 꺼졌습니다. 데이터 정보는 원격 서버 대신 브라우저 로컬 저장소 상에 안전하게 머무릅니다.');
    }
  };

  const handlePushAll = async () => {
    if (!supabaseUrl || !supabaseKey) {
      alert('Supabase 연결 정보 설정이 선행되어야 합니다.');
      return;
    }
    if (!confirm('경고: 현재 기기 및 로컬에 저장된 모든 데이터(교인 정보, 출석 기록, 헌금 수납, 중보기도, 심방부, 주보)를 클라우드 데이터베이스 서버로 일제히 전송(UPSERT)합니다. 계속하겠습니까?')) return;
    
    setSyncStatus('pushing');
    setSyncMsg('은혜교회 로컬 임시 세션 전산 목록 일체를 Supabase 클라우드로 밀어 넣는 중...');
    
    const res = await pushAllToSupabase({
      members,
      offerings,
      prayers,
      visitations,
      bulletin,
      config
    });

    if (res.success) {
      setSyncStatus('success');
      setSyncMsg(res.message);
    } else {
      setSyncStatus('error');
      setSyncMsg(res.message);
    }
  };

  const handlePullAll = async () => {
    if (!supabaseUrl || !supabaseKey) {
      alert('Supabase 연결 정보 설정이 선행되어야 합니다.');
      return;
    }
    if (!confirm('인입 경고: Supabase 클라우드 서버에 정식 보존된 모든 데이터베이스 테이블 자료를 인하받아 현재 전산에 대조 적용합니다. 작성 중이던 로컬 내역은 대체될 수 있습니다. 계속합니까?')) return;

    setSyncStatus('pulling');
    setSyncMsg('Supabase 원격 클라우드 데이터베이스에서 모든 목양 전산 테이블을 동기화 인입 중...');

    const res = await pullFromSupabase();
    if (res.success && res.data) {
      setSyncStatus('success');
      setSyncMsg(res.message);
      onImportSyncedData(res.data);
    } else {
      setSyncStatus('error');
      setSyncMsg(res.message || '데이터 인입에 실패하였습니다.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="church-settings-panel">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div>
          <h2 className="text-xl font-extrabold text-gray-950 tracking-tight flex items-center gap-2">
            ⚙️ 교회 환경설정 & 클라우드 연동
          </h2>
          <p className="text-xs text-slate-500 mt-1">우리 교회의 아이덴티티를 브랜딩하고, Supabase RDBMS 클라우드와 전산 데이터를 연천/상호 연동합니다.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>기본값 초기화</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT CONFIGURATION PANEL (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CARD A: IDENTITY BRANDING */}
          <form onSubmit={handleSubmit}>
            <div className="bento-card-style p-6 space-y-5 bg-white border border-slate-150 rounded-2xl shadow-sm">
              <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 block flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>교회 기본 브랜딩 & 로고 아이덴티티</span>
              </h3>

              {/* Church Denomination and Name Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">소속 교단 (예: 교단명)</label>
                  <input
                    type="text"
                    value={denomination}
                    onChange={(e) => setDenomination(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-250 p-3 bg-white font-semibold text-slate-800 focus:outline-emerald-600 transition-all"
                    placeholder="예: 대한예수교장로회"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">교회 이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-250 p-3 bg-white font-extrabold text-slate-900 focus:outline-emerald-600 transition-all"
                    placeholder="예: 은혜교회"
                    required
                  />
                </div>
              </div>

              {/* Logo Style Toggle Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 block">교회 로고 / 엠블럼 형식</label>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLogoType('emoji');
                      if (PRESET_EMOJIS.indexOf(logoValue) === -1 && !logoValue.startsWith('http')) {
                        // Keep
                      } else if (logoValue.startsWith('http')) {
                        setLogoValue('✞');
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-center font-bold text-xs transition-with cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      logoType === 'emoji'
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">✞</span>
                    <span>단일 기호 / 이모지 선택</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLogoType('url');
                      if (!logoValue.startsWith('http')) {
                        setLogoValue('https://images.unsplash.com/photo-1548625361-155de8c7375a?q=80&w=200&auto=format&fit=crop'); 
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-center font-bold text-xs transition-with cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      logoType === 'url'
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Image className="h-5 w-5 text-slate-600" />
                    <span>맞춤 이미지 외부 URL</span>
                  </button>
                </div>
              </div>

              {/* Dynamic input according to logoType */}
              {logoType === 'emoji' ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">추천 기호 엠블럼 프리셋</label>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {PRESET_EMOJIS.map(item => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setLogoValue(item)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg border text-lg transition-all cursor-pointer ${
                            logoValue === item
                              ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold scale-105 shadow'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-505 block mb-1">직접 기호/글자 입력 (텍스트 1자 권장)</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={logoValue}
                      onChange={(e) => setLogoValue(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-250 p-2.5 bg-white font-extrabold text-slate-800"
                      placeholder="예: ✞"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">외부 로고 이미지 웹 주소 (HTTPS URL)</label>
                    <input
                      type="url"
                      value={logoValue}
                      onChange={(e) => setLogoValue(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-250 p-3 bg-white font-mono text-slate-700 focus:outline-emerald-600"
                      placeholder="https://example.com/logo-image.png"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      인터넷에 업로드되어 있는교회의 정식 png 투명 로고 또는 아이콘의 단축 주소를 넣어주십시오. (CDN/S3 등)
                    </p>
                  </div>

                  {logoValue && logoValue.startsWith('http') && (
                    <div className="flex items-center gap-3 bg-white p-2 border border-slate-250 rounded-lg">
                      <span className="text-[10px] text-slate-400 shrink-0 font-bold">이미지 실시간 대조:</span>
                      <div className="w-10 h-10 border border-slate-200 rounded overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                        <img 
                          src={logoValue} 
                          alt="Church Logo Preview" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/40x40?text=Error';
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold truncate block max-w-[200px]">{logoValue}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-extrabold text-xs text-white px-5 py-3 shadow-md flex items-center gap-2 transition-transform active:scale-98 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>기초 브랜딩 설정 저장</span>
                </button>
              </div>

              {saveSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-3 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2 animate-bounce">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>교회 설정이 내부 메모리에 저장되어 실시간 적용되었습니다!</span>
                </div>
              )}
            </div>
          </form>

          {/* CARD B: SUPABASE CLOUD DATABASE SYNC */}
          <div className="bento-card-style p-6 space-y-5 bg-white border border-slate-150 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 block flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" />
                <span>🌐 Supabase 실시간 클라우드 DB 연동</span>
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                테스트베드 공식 지원
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-[#F8FAFC] border border-slate-200 p-3 rounded-lg flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                이 목양시스템은 <strong>오프라인 우선(Local Storage)</strong> 기술로 가동됩니다. 하기에 본인의 <strong>Supabase 프로젝트 연결 정보(URL 및 API Anon Key)</strong>를 작성하면, 로컬 단말 전산 내역을 원격 클라우드로 무제한 백업/복구 및 실시간 자동 싱크(Live-Sync)할 수 있습니다.
              </span>
            </p>

            {/* Supabase inputs */}
            <div className="space-y-4 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Supabase Project URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-250 pl-9 p-3 bg-white text-slate-800 placeholder-slate-400 focus:outline-emerald-600"
                    placeholder="https://your-project-ref.supabase.co"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Supabase Anon API Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Terminal className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-250 pl-9 pr-10 p-3 bg-white text-slate-800 placeholder-slate-400 focus:outline-emerald-600"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Save Key Trigger */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleSaveCredentials}
                className="rounded-xl border border-slate-320 hover:bg-slate-50 font-bold text-xs text-slate-700 px-4 py-2.5 cursor-pointer transition-colors"
              >
                연결 정보 적용 & 로컬 저장
              </button>
              
              <button
                type="button"
                onClick={handleTestConnection}
                className="rounded-xl bg-slate-900 hover:bg-black font-extrabold text-xs text-white px-5 py-2.5 shadow cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Cloud className="h-4 w-4" />
                <span>연결 전산 상태 테스트</span>
              </button>
            </div>

            {/* Test Feed */}
            {testStatus && (
              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                testStatus === 'checking' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                testStatus === 'connected' ? 'bg-emerald-50 border-emerald-150 text-emerald-800 font-semibold' :
                'bg-red-50 border-red-150 text-red-800'
              }`}>
                {testStatus === 'checking' ? (
                  <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-amber-600 mt-0.5" />
                ) : testStatus === 'connected' ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                )}
                <div>{testMsg}</div>
              </div>
            )}

            {/* LIVE SYNC TOGGLE BUTTON */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner">
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-[#111827] flex items-center gap-1.5">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${liveSync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  실시간 자동 클라우드 동기화 (Live-Sync Mode)
                </span>
                <p className="text-[10.5px] text-slate-400">활성화 시 추가/수정된 자료가 지체없이 Supabase 원격 테이블로 전산 전송됩니다.</p>
              </div>

              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={liveSync} 
                    onChange={(e) => handleToggleLiveSync(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* PUSH & PULL SYSTEM COMMANDS */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-700">📤 📥 데이터 일괄 덤프 백업 / 전체 대조 통합</h4>
              
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={handlePushAll}
                  className="p-3.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50 text-emerald-800 transition-colors cursor-pointer text-left space-y-1"
                >
                  <div className="flex items-center gap-2 font-black text-xs">
                    <Upload className="h-4 w-4 text-emerald-600" />
                    <span>클라우드로 전체 백업 전송 (Push)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">현재 기기의 모든 로컬 전산 정보 전체를 Supabase 테이블로 일괄 전송(백업)합니다.</p>
                </button>

                <button
                  type="button"
                  onClick={handlePullAll}
                  className="p-3.5 rounded-xl border border-dashed border-sky-300 bg-sky-50/20 hover:bg-sky-50 text-sky-850 transition-colors cursor-pointer text-left space-y-1"
                >
                  <div className="flex items-center gap-2 font-black text-xs text-sky-905">
                    <Download className="h-4 w-4 text-sky-600" />
                    <span>클라우드 정보 전체 인입 (Pull)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">Supabase 구름 서버에 정식 수납 보관된 모든 교직 전산 기록을 내 단말로 동기화 인입(덮어쓰기)합니다.</p>
                </button>
              </div>
            </div>

            {/* Sync Feed */}
            {syncStatus && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                syncStatus === 'pushing' || syncStatus === 'pulling' ? 'bg-blue-50 text-blue-800 border border-blue-150' :
                syncStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150 font-semibold' :
                'bg-red-50 text-red-800 border border-red-150'
              }`}>
                {(syncStatus === 'pushing' || syncStatus === 'pulling') ? (
                  <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-blue-600" />
                ) : syncStatus === 'success' ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                )}
                <div>{syncMsg}</div>
              </div>
            )}

            {/* SQL SCHEMA BLOCK IN ACCORDION */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="w-full text-left p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-slate-500" />
                  <span>📁 [필수] Supabase 테이블 생성 SQL 스크립트 복사</span>
                </span>
                <span className="text-[10px] uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                  {showSql ? '접기 ▲' : '열기 ▼'}
                </span>
              </button>

              {showSql && (
                <div className="p-4 border-t border-slate-200 space-y-3">
                  <p className="text-[10.5px] text-slate-500 leading-normal">
                    본인의 Supabase 프로젝트 <strong>SQL Editor</strong> 탭을 클릭하여 새 쿼리를 만들고 아래 코드를 그대로 <strong>인명 붙여넣은 뒤 Run 버튼</strong>을 실행해 주십시오. 6개의 서비스 보조 테이블이 즉각 기장됩니다.
                  </p>

                  <div className="relative">
                    <pre className="text-[10px] leading-relaxed font-mono bg-[#1E293B] text-slate-200 p-4 rounded-lg overflow-x-auto max-h-[220px]">
                      {SUPABASE_SQL_SCHEMA}
                    </pre>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-white p-1.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? '복사대조 완료' : '코드 복사'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT LIVE SAMPLE VISUAL PLAYGROUND (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* HEADER PREVIEW DISPLAY */}
          <div className="bento-card-style p-5 space-y-3.5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white border-slate-800 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">교인 종합 모인앱 헤더 적용 프리뷰</span>
            
            <div className="bg-[#1A2E26] text-white p-3.5 rounded-xl border border-emerald-800/30 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-600/30 border border-emerald-500/20 w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden">
                {logoType === 'emoji' ? (
                  <span className="text-lg font-black text-emerald-400 select-none">{logoValue}</span>
                ) : (
                  <img src={logoValue} alt="logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                )}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] bg-emerald-500/25 text-emerald-300 font-bold tracking-widest uppercase px-1 py-0.2 rounded shrink-0">통합 전산</span>
                  <span className="text-[8px] text-gray-400 truncate font-mono">{denomination || '소속 교단'}</span>
                </div>
                <h1 className="text-xs md:text-sm font-extrabold tracking-tight mt-0.5 truncate text-white">
                  {denomination ? `${denomination} ` : ''}{name} 목양시스템
                </h1>
              </div>
            </div>
          </div>

          {/* BULLETIN BRANDING CARD PREVIEW */}
          <div className="bento-card-style p-5 space-y-3 bg-white border border-slate-150 rounded-2xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">주보 상단 엠블럼 브랜딩 자동 대조</span>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="rounded-full bg-blue-50/50 border border-slate-200/50 w-9 h-9 shrink-0 flex items-center justify-center overflow-hidden">
                {logoType === 'emoji' ? (
                  <span className="text-base text-[#3B82F6] font-bold">{logoValue}</span>
                ) : (
                  <img src={logoValue} alt="logo" className="w-full h-full object-contain" />
                )}
              </div>
              <div>
                <span className="text-[9px] font-extrabold border bg-blue-50 border-blue-105/30 text-[#3B82F6] px-1.5 py-0.2 rounded block w-max mt-0.5">
                  디지털 보관
                </span>
                <p className="text-xs font-extrabold text-[#1E293B] mt-1">{denomination} {name}</p>
              </div>
            </div>
          </div>

          {/* MOBILE MESSAGE BRANDING PREVIEW */}
          <div className="bento-card-style p-5 space-y-2.5 bg-white border border-slate-150 rounded-2xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">교인 발송용 알림톡 하단 꼬리표</span>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 font-sans text-xs text-slate-700 space-y-2 border-dashed">
              <div className="w-max bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Kakao Alimtalk Preview</div>
              <p className="italic text-[11px] text-slate-400">...귀한 예물 올리신 성도님께 감사와 찬양을 보냅니다.</p>
              <p className="font-bold text-[11px] text-slate-800 border-t border-amber-200/50 pt-1.5 text-right">
                - {name} 사무국 목양실
              </p>
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
