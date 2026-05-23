/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Member, Offering, Visitation, Prayer, Bulletin, ChurchConfig } from './types';
import { 
  INITIAL_MEMBERS, INITIAL_OFFERINGS, INITIAL_VISITATIONS, 
  INITIAL_PRAYERS, INITIAL_BULLETIN 
} from './data/mockData';

// Component Imports
import Dashboard from './components/Dashboard';
import MemberManagement from './components/MemberManagement';
import OfferingManagement from './components/OfferingManagement';
import VisitationAndPrayer from './components/VisitationAndPrayer';
import DigitalBulletin from './components/DigitalBulletin';
import MyPage from './components/MyPage';
import NotificationModal from './components/NotificationModal';
import ChurchSettings from './components/ChurchSettings';

// Icons
import { 
  LayoutDashboard, Users, Banknote, Heart, BookOpen, Smartphone, 
  Shield, User, LogOut, Sparkles, MessageSquare, Settings
} from 'lucide-react';

export default function App() {
  // 1. Core Persistent States from LocalStorage / Mock fallback
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('CHURCH_MEMBERS');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [offerings, setOfferings] = useState<Offering[]>(() => {
    const saved = localStorage.getItem('CHURCH_OFFERINGS');
    return saved ? JSON.parse(saved) : INITIAL_OFFERINGS;
  });

  const [visitations, setVisitations] = useState<Visitation[]>(() => {
    const saved = localStorage.getItem('CHURCH_VISITATIONS');
    return saved ? JSON.parse(saved) : INITIAL_VISITATIONS;
  });

  const [prayers, setPrayers] = useState<Prayer[]>(() => {
    const saved = localStorage.getItem('CHURCH_PRAYERS');
    return saved ? JSON.parse(saved) : INITIAL_PRAYERS;
  });

  const [bulletin, setBulletin] = useState<Bulletin>(() => {
    const saved = localStorage.getItem('CHURCH_BULLETIN');
    return saved ? JSON.parse(saved) : INITIAL_BULLETIN;
  });

  const [churchConfig, setChurchConfig] = useState<ChurchConfig>(() => {
    const saved = localStorage.getItem('CHURCH_CONFIG');
    return saved ? JSON.parse(saved) : {
      name: '은혜교회',
      denomination: '대한예수교장로회',
      logoType: 'emoji',
      logoValue: '✞'
    };
  });

  // Save changes to localStorage automatically
  useEffect(() => {
    localStorage.setItem('CHURCH_MEMBERS', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('CHURCH_OFFERINGS', JSON.stringify(offerings));
  }, [offerings]);

  useEffect(() => {
    localStorage.setItem('CHURCH_VISITATIONS', JSON.stringify(visitations));
  }, [visitations]);

  useEffect(() => {
    localStorage.setItem('CHURCH_PRAYERS', JSON.stringify(prayers));
  }, [prayers]);

  useEffect(() => {
    localStorage.setItem('CHURCH_BULLETIN', JSON.stringify(bulletin));
  }, [bulletin]);

  useEffect(() => {
    localStorage.setItem('CHURCH_CONFIG', JSON.stringify(churchConfig));
  }, [churchConfig]);

  // Pull latest data from Supabase once on app load if live sync is active
  useEffect(() => {
    const isLiveSync = localStorage.getItem('SUPABASE_LIVE_SYNC') === 'true';
    if (!isLiveSync) return;

    import('./lib/supabaseSync').then(({ pullFromSupabase }) => {
      pullFromSupabase().then(res => {
        if (res.success && res.data) {
          setMembers(res.data.members);
          setOfferings(res.data.offerings);
          setPrayers(res.data.prayers);
          setVisitations(res.data.visitations);
          setBulletin(res.data.bulletin);
          setChurchConfig(res.data.config);
          console.log('Successfully auto-pulled data from Supabase on startup.');
        }
      });
    }).catch(err => console.error('Initial Supabase pull error:', err));
  }, []);

  // 2. Role-based Navigation state
  // "ADMIN" | "MEMBER"
  const [userRole, setUserRole] = useState<'ADMIN' | 'MEMBER'>('ADMIN');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');

  // 3. Kakao AlimTalk Modal States
  const [isAlimTalkOpen, setIsAlimTalkOpen] = useState(false);
  const [alimTalkTemplate, setAlimTalkTemplate] = useState<'general' | 'birthday' | 'offering'>('general');
  const [alimTalkTargetMember, setAlimTalkTargetMember] = useState<Member | null>(null);
  const [alimTalkAmount, setAlimTalkAmount] = useState(0);
  const [alimTalkOfferingType, setAlimTalkOfferingType] = useState('');

  // 4. State Modifier Handlers to maintain single source of truth
  const triggerAutoSync = (type: 'member' | 'offering' | 'prayer' | 'visitation' | 'bulletin' | 'config', payload: any) => {
    const isLiveSync = localStorage.getItem('SUPABASE_LIVE_SYNC') === 'true';
    if (!isLiveSync) return;

    import('./lib/supabaseSync').then(({ syncSingleMember, syncSingleOffering, syncSinglePrayer, syncSingleVisitation, syncBulletin, syncChurchConfig }) => {
      if (type === 'member') syncSingleMember(payload);
      else if (type === 'offering') syncSingleOffering(payload);
      else if (type === 'prayer') syncSinglePrayer(payload);
      else if (type === 'visitation') syncSingleVisitation(payload);
      else if (type === 'bulletin') syncBulletin(payload);
      else if (type === 'config') syncChurchConfig(payload);
    }).catch(err => console.error('AutoSync Error:', err));
  };

  const handleImportSyncedData = (newData: {
    members: Member[];
    offerings: Offering[];
    prayers: Prayer[];
    visitations: Visitation[];
    bulletin: Bulletin;
    config: ChurchConfig;
  }) => {
    setMembers(newData.members);
    setOfferings(newData.offerings);
    setPrayers(newData.prayers);
    setVisitations(newData.visitations);
    setBulletin(newData.bulletin);
    setChurchConfig(newData.config);
  };

  const handleVerifyOffering = (id: string) => {
    setOfferings(prev => prev.map(o => {
      if (o.id === id) {
        const updated = { ...o, confirmed: true };
        triggerAutoSync('offering', updated);
        return updated;
      }
      return o;
    }));
  };

  const handleAddMember = (m: Member) => {
    setMembers(prev => [m, ...prev]);
    triggerAutoSync('member', m);
  };

  const handleUpdateMember = (m: Member) => {
    setMembers(prev => prev.map(item => item.id === m.id ? m : item));
    triggerAutoSync('member', m);
  };

  const handleAddOffering = (o: Offering) => {
    setOfferings(prev => [o, ...prev]);
    triggerAutoSync('offering', o);
  };

  const handleAddVisitation = (v: Visitation) => {
    setVisitations(prev => [v, ...prev]);
    triggerAutoSync('visitation', v);
  };

  const handleAddPrayer = (p: Prayer) => {
    setPrayers(prev => [p, ...prev]);
    triggerAutoSync('prayer', p);
  };

  const handlePray = (id: string) => {
    setPrayers(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, prayCount: p.prayCount + 1 };
        triggerAutoSync('prayer', updated);
        return updated;
      }
      return p;
    }));
  };

  const handleCompletePrayer = (id: string) => {
    setPrayers(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, completed: true };
        triggerAutoSync('prayer', updated);
        return updated;
      }
      return p;
    }));
  };

  const handleUpdateBulletin = (newB: Bulletin) => {
    setBulletin(newB);
    triggerAutoSync('bulletin', newB);
  };

  // Open Simulator modal
  const handleOpenAlimTalk = (
    template: 'general' | 'birthday' | 'offering',
    member: Member | null,
    oType?: string,
    amount?: number
  ) => {
    setAlimTalkTemplate(template);
    setAlimTalkTargetMember(member);
    setAlimTalkAmount(amount || 0);
    setAlimTalkOfferingType(oType || '');
    setIsAlimTalkOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-800 font-sans flex flex-col" id="app-root-shell">
      
      {/* 1. TOP UTILITY APP HEADER */}
      <header className="bg-[#1A2E26] text-white px-4 md:px-8 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-600/30 border border-emerald-500/20 w-10 h-10 p-2 shrink-0 flex items-center justify-center overflow-hidden">
            {churchConfig.logoType === 'emoji' ? (
              <span className="text-xl font-black text-emerald-400 select-none">{churchConfig.logoValue}</span>
            ) : (
              <img 
                src={churchConfig.logoValue} 
                alt="logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/40x40?text=Logo';
                }}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-emerald-500/25 text-emerald-300 font-bold tracking-widest uppercase px-1.5 py-0.2 rounded">교회 행정 통합 시스템</span>
              <span className="text-[10px] text-gray-400">• v1.4 Softr Sync</span>
            </div>
            <h1 className="text-base md:text-lg font-extrabold tracking-tight mt-0.5">
              {churchConfig.denomination ? `${churchConfig.denomination} ` : ''}{churchConfig.name} 목양시스템
            </h1>
          </div>
        </div>

        {/* ROLE CHOP BADGES (Toggle Admin v.s. Congregation) */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-[11px] text-gray-300 font-medium">체험 모드 전환:</span>
          <div className="bg-emerald-950/80 p-0.5 rounded-xl border border-emerald-800/30 flex text-xs font-semibold">
            <button
              onClick={() => { setUserRole('ADMIN'); setActiveAdminTab('dashboard'); }}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                userRole === 'ADMIN'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>교회 관리자</span>
            </button>
            <button
              onClick={() => setUserRole('MEMBER')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                userRole === 'MEMBER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>성도 마이페이지</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. ADMIN TABS ROW (ONLY VISIBLE ON ADMIN ROLE) */}
      {userRole === 'ADMIN' && (
        <nav className="bg-white border-b border-gray-150 px-4 md:px-8 flex space-x-1 md:space-x-2 overflow-x-auto scrollbar-none shadow-xs shrink-0">
          <button
            onClick={() => setActiveAdminTab('dashboard')}
            className={`flex items-center gap-2 py-4 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeAdminTab === 'dashboard'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>목양 대시보드</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('members')}
            className={`flex items-center gap-2 py-4 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeAdminTab === 'members'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>교인 관리 명부</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('offerings')}
            className={`flex items-center gap-2 py-4 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeAdminTab === 'offerings'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Banknote className="h-4 w-4 shrink-0" />
            <span>헌금 관리 장부</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('visitations')}
            className={`flex items-center gap-2 py-4 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeAdminTab === 'visitations'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Heart className="h-4 w-4 shrink-0" />
            <span>심방 및 중보기도</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('bulletin')}
            className={`flex items-center gap-2 py-4 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeAdminTab === 'bulletin'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>실시간 디지털 주보</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`flex items-center gap-2 py-4 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeAdminTab === 'settings'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>교회 환경설정</span>
          </button>
        </nav>
      )}

      {/* 3. CORE CLIENT VIEW GRID AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {userRole === 'ADMIN' ? (
          /* ADMIN ROUTER PANELS */
          <>
            {activeAdminTab === 'dashboard' && (
              <Dashboard 
                members={members}
                offerings={offerings}
                prayers={prayers}
                onVerifyOffering={handleVerifyOffering}
                onOpenAlimtalk={(temp, m, type, amt) => handleOpenAlimTalk(temp, m, type, amt)}
                onSwitchTab={(target) => setActiveAdminTab(target)}
                onPray={handlePray}
              />
            )}
            
            {activeAdminTab === 'members' && (
              <MemberManagement 
                members={members}
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onOpenAlimtalk={(temp, m) => handleOpenAlimTalk(temp, m)}
              />
            )}

            {activeAdminTab === 'offerings' && (
              <OfferingManagement 
                offerings={offerings}
                members={members}
                onAddOffering={handleAddOffering}
                onVerifyOffering={handleVerifyOffering}
                onOpenAlimtalk={(temp, m, type, amt) => handleOpenAlimTalk(temp, m, type, amt)}
              />
            )}

            {activeAdminTab === 'visitations' && (
              <VisitationAndPrayer 
                visitations={visitations}
                prayers={prayers}
                members={members}
                onAddVisitation={handleAddVisitation}
                onAddPrayer={handleAddPrayer}
                onPray={handlePray}
                onCompletePrayer={handleCompletePrayer}
                onOpenAlimtalk={(temp, m) => handleOpenAlimTalk(temp, m)}
              />
            )}

            {activeAdminTab === 'bulletin' && (
              <DigitalBulletin 
                bulletin={bulletin}
                onUpdateBulletin={handleUpdateBulletin}
                onOpenAlimtalk={(temp, m) => handleOpenAlimTalk(temp, null)}
                churchConfig={churchConfig}
              />
            )}

            {activeAdminTab === 'settings' && (
              <ChurchSettings 
                config={churchConfig}
                onUpdateConfig={(newConfig) => {
                  setChurchConfig(newConfig);
                  triggerAutoSync('config', newConfig);
                }}
                members={members}
                offerings={offerings}
                prayers={prayers}
                visitations={visitations}
                bulletin={bulletin}
                onImportSyncedData={handleImportSyncedData}
              />
            )}
          </>
        ) : (
          /* MEMBER SPECIFIC MYPAGE */
          <MyPage 
            members={members}
            offerings={offerings}
            prayers={prayers}
            bulletin={bulletin}
            onUpdateMember={handleUpdateMember}
            onAddPrayer={handleAddPrayer}
            onAddOffering={handleAddOffering}
            churchConfig={churchConfig}
          />
        )}
      </main>

      {/* 4. CONGREGATIONAL SYSTEM FOOTER */}
      <footer className="bg-white border-t border-gray-150 py-5 text-center text-xs text-gray-400 shrink-0">
        <p className="font-semibold text-gray-500">지상의 작은 교회들을 조력하는 {churchConfig.name} 통합 비즈니스 네트워크</p>
        <p className="mt-1 font-mono text-[10.5px]">© 2026 {churchConfig.name} Admin Server. Powered by React 19 & Tailwind CSS 4</p>
      </footer>

      {/* 5. FLOATING KAKAO SIMULATOR BAR TRIGGER IN DEV */}
      <div className="fixed bottom-4 right-4 z-40 hidden md:block">
        <button
          onClick={() => handleOpenAlimTalk('general', null)}
          className="flex items-center gap-1.5 rounded-full bg-amber-400/90 py-2.5 px-4 text-xs font-bold text-gray-900 shadow-lg hover:scale-105 transition-transform"
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span>AlimTalk 수동발송</span>
        </button>
      </div>

       {/* 6. GLOBAL KAKAO ALIMTALK MODAL PORTAL */}
      <NotificationModal 
        isOpen={isAlimTalkOpen}
        onClose={() => setIsAlimTalkOpen(false)}
        initialTemplate={alimTalkTemplate}
        targetMember={alimTalkTargetMember}
        amount={alimTalkAmount}
        offeringType={alimTalkOfferingType}
        churchConfig={churchConfig}
      />

    </div>
  );
}
