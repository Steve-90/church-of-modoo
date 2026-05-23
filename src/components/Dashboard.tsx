/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Member, Offering, Prayer } from '../types';
import { 
  Users, CheckSquare, Banknote, Gift, Heart, Calendar, 
  MessageSquare, UserPlus, Check, ArrowRight, ClipboardList, Clock, Sparkles
} from 'lucide-react';

interface DashboardProps {
  members: Member[];
  offerings: Offering[];
  prayers: Prayer[];
  onVerifyOffering: (id: string) => void;
  onOpenAlimtalk: (template: 'general' | 'birthday' | 'offering', member: Member | null, offeringType?: string, amount?: number) => void;
  onSwitchTab: (tab: string) => void;
  onPray: (id: string) => void;
}

export default function Dashboard({
  members,
  offerings,
  prayers,
  onVerifyOffering,
  onOpenAlimtalk,
  onSwitchTab,
  onPray
}: DashboardProps) {
  const [isOfferingHidden, setIsOfferingHidden] = useState(true);
  
  // 1. Calculations for Core Stats
  const totalMembers = members.filter(m => m.status === '재적').length;
  
  // Last Sunday Attendance (e.g., 2026-05-17)
  const lastSundayStr = '2026-05-17';
  const lastSundayActiveMembers = members.filter(m => m.status === '재적');
  const attendedCount = lastSundayActiveMembers.filter(m => m.attendance[lastSundayStr] === true).length;
  const attendanceRate = lastSundayActiveMembers.length > 0 
    ? Math.round((attendedCount / lastSundayActiveMembers.length) * 100) 
    : 0;

  // Monthly Offering Total (May 2026)
  const currentMonthOfferings = offerings.filter(o => {
    return o.date.startsWith('2026-05') && o.confirmed;
  });
  const monthlyOfferingSum = currentMonthOfferings.reduce((sum, o) => sum + o.amount, 0);

  // 2. Identify Birthdays this week (Current is May 23, 2026, Sabbath week)
  // Let's check birthdays with birth months = 05 and day in range of interest
  const thisWeekBirthdays = members.filter(m => {
    if (!m.birthDate) return false;
    const [_, month, day] = m.birthDate.split('-');
    if (month !== '05') return false;
    const dayNum = parseInt(day, 10);
    // May 20 to May 27
    return dayNum >= 20 && dayNum <= 27;
  });

  // 3. Absent in the last service (May 17, 2026) & Inactive
  const absentMembers = members.filter(m => m.status === '재적' && m.attendance[lastSundayStr] === false);

  // 4. Offerings Awaiting Deposit confirmation
  const unconfirmedOfferings = offerings.filter(o => !o.confirmed);

  // 5. Recent registered members
  const recentRegistrants = members
    .filter(m => m.registeredAt && m.registeredAt.startsWith('2026'))
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));

  return (
    <div className="space-y-8" id="dashboard-tab-content">
      
      {/* 1. KEY METRICS STATS CARDS */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3" id="stats-section">
        {/* Metric 1 */}
        <div className="bento-card-style p-6 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[12px] font-bold text-[#94A3B8] tracking-wider uppercase block">전체 재적 성도</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-extrabold text-[#1E293B] tracking-tight">{totalMembers}명</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">▲ 3명 등록 (이번 달)</p>
          </div>
          <div className="rounded-xl bg-blue-50/80 p-3.5 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bento-card-style p-6 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[12px] font-bold text-[#94A3B8] tracking-wider uppercase block">지난 주일 출석률</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-extrabold text-[#1E293B] tracking-tight">{attendanceRate}%</span>
              <span className="text-xs font-semibold text-gray-500">
                ({attendedCount}/{lastSundayActiveMembers.length}명)
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">▲ 2.5% (전주 대비)</p>
          </div>
          <div className="rounded-xl bg-emerald-50/80 p-3.5 text-emerald-600">
            <CheckSquare className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => setIsOfferingHidden(!isOfferingHidden)} 
          className="bento-card-style p-6 flex items-center justify-between group cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all select-none"
          title="클릭하여 금액 보기"
        >
          <div className="space-y-1 w-full">
            <span className="text-[12px] font-bold text-[#94A3B8] tracking-wider uppercase block">이달의 헌금 합계</span>
            <div className="flex items-baseline gap-1 min-h-[40px] flex-wrap items-center">
              {isOfferingHidden ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors">
                  <span>🔒 클릭하여 금액 보기</span>
                </div>
              ) : (
                <span className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B] tracking-tight transition-all">
                  ₩{monthlyOfferingSum.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#94A3B8] font-medium mt-1">목표 대비 92% 달성</p>
          </div>
          <div className="rounded-xl bg-amber-50/80 p-3.5 text-amber-600 shrink-0">
            <Banknote className="h-6 w-6 animate-pulse" />
          </div>
        </div>
      </section>

      {/* 2. MID-TIER HORIZONTAL SCROLL CARDS ('이번 주 생일자' & '이번 주 심방 예정 성도') */}
      <section className="space-y-3" id="weekly-lists-section">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-emerald-600" /> 이번 주의 실시간 목양 알림 (가로형)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Birthdays Horizontal Card */}
          <div className="bento-card-style p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3.5">
                <span className="flex items-center gap-2 text-sm font-bold text-[#1A1F26]">
                  <Gift className="h-4.5 w-4.5 text-pink-500" /> 금주 생일자 <span className="text-pink-600 font-normal">({thisWeekBirthdays.length}명)</span>
                </span>
                <span className="text-[10px] tag-badge tag-birthday">5월 20일~27일</span>
              </div>
              
              <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none">
                {thisWeekBirthdays.length > 0 ? (
                  thisWeekBirthdays.map(m => {
                    const [_, birthMonth, birthDay] = m.birthDate.split('-');
                    return (
                      <div 
                        key={m.id} 
                        className="min-w-[130px] rounded-xl border border-pink-100 bg-pink-50/20 p-3.5 text-center transition-all hover:bg-pink-50/40"
                      >
                        <p className="font-bold text-xs text-gray-900">{m.name}</p>
                        <p className="text-[11px] font-bold text-pink-600 mt-1">{birthMonth}월 {birthDay}일</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{m.duty}</p>
                        <button
                          onClick={() => onOpenAlimtalk('birthday', m)}
                          className="mt-2 w-full rounded-lg bg-white border border-pink-200 py-1 text-[10px] font-bold text-pink-700 hover:bg-pink-100/50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <MessageSquare className="h-2.5 w-2.5" /> 축하톡
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 py-4 w-full text-center">이번 주 생일 성도가 없습니다.</p>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between text-[11px] text-[#64748B]">
              <span>알림톡 발송과 주보 전산 자동 연동</span>
              <button onClick={() => onSwitchTab('members')} className="text-[#3B82F6] hover:underline flex items-center gap-0.5 font-bold">
                전체 교인 보기 <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Absent / Visitation Requested Horizontal Card */}
          <div className="bento-card-style p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3.5">
                <span className="flex items-center gap-2 text-sm font-bold text-[#1A1F26]">
                  <Heart className="h-4.5 w-4.5 text-rose-500" /> 주일 결석 / 심방 필요 성도 <span className="text-rose-600 font-normal">({absentMembers.length}명)</span>
                </span>
                <span className="text-[10px] tag-badge tag-visit">이중 결석 경보</span>
              </div>
              
              <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none">
                {absentMembers.length > 0 ? (
                  absentMembers.map(m => (
                    <div 
                      key={m.id} 
                      className="min-w-[130px] rounded-xl border border-rose-100 bg-rose-50/20 p-3.5 text-center transition-all hover:bg-rose-50/40"
                    >
                      <p className="font-bold text-xs text-gray-900">{m.name}</p>
                      <p className="text-[11px] font-bold text-rose-600 mt-1">지난주 미출석</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{m.district} • {m.duty}</p>
                      <button
                        onClick={() => onSwitchTab('visitations')}
                        className="mt-2 w-full rounded-lg bg-white border border-rose-200 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100/50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Calendar className="h-2.5 w-2.5" /> 심방예약
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-4 w-full text-center">결석한 활성 교인이 없습니다.</p>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between text-[11px] text-[#64748B]">
              <span>장기 결석자 관리 긴급 체크리스트 자동 추가</span>
              <button onClick={() => onSwitchTab('visitations')} className="text-[#3B82F6] hover:underline flex items-center gap-0.5 font-bold">
                심방 피드 이동 <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>�
      {/* 3. CORE TWO BLOCK DETAIL (Left: Prayers Feed, Right: Checklist / Quick Action Drawer) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* LEFT COLUMN: LATEST PRAYER REQUESTS FEED (8 cols) */}
        <section className="lg:col-span-8 space-y-3">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 pb-1">
            <Sparkles className="h-4.5 w-4.5 text-amber-500" /> 실시간 중보기도 피드 및 교회의 소리
          </h3>
          <div className="bento-card-style p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3.5">
              <div>
                <h4 className="font-bold text-[#1A1F26] text-base">가장 최근 성도의 기도제목</h4>
                <p className="text-xs text-[#64748B] mt-0.5">성도 마이페이지 및 심방 면담에서 실시간 등록된 간구 항목입니다.</p>
              </div>
              <button 
                onClick={() => onSwitchTab('visitations')}
                className="text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-0.5"
              >
                전체 기도 목록 <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {prayers.filter(p => !p.completed).slice(0, 4).map(p => (
                <div key={p.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between md:items-center gap-3">
                  <div className="space-y-1.5 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1A1F26]">{p.memberName} 성도</span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">{p.createdAt}</span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed font-sans">{p.content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => onPray(p.id)}
                      className="rounded-full bg-amber-50 hover:bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Heart className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>동참 {p.prayCount}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: ACTION PANELS & COMPLIANCE (4 cols) */}
        <section className="lg:col-span-4 space-y-5">
          {/* Quick Shortcuts */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-[#3B82F6]" /> 바로가기
            </h3>
            <div className="bento-card-style p-5 flex flex-col gap-3">
              <button
                onClick={() => onOpenAlimtalk('general', null)}
                className="flex w-full items-center justify-between rounded-xl bg-blue-50/40 hover:bg-blue-50/80 px-4 py-3 border border-blue-100 transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-[#3B82F6] p-2 text-white shadow-sm">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1A1F26]">알림톡 보내기</p>
                    <p className="text-[10.5px] text-[#64748B]">전체 공지 및 그룹 발송</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#3B82F6] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onSwitchTab('offerings')}
                className="flex w-full items-center justify-between rounded-xl bg-amber-50/40 hover:bg-amber-50/80 px-4 py-3 border border-amber-100 transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-amber-500 p-2 text-white shadow-sm font-bold">
                    ₩
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1A1F26]">헌금 입력 및 통계</p>
                    <p className="text-[10.5px] text-[#64748B]">날짜별 예물 간편 대장</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onSwitchTab('bulletin')}
                className="flex w-full items-center justify-between rounded-xl bg-emerald-50/40 hover:bg-emerald-50/80 px-4 py-3 border border-emerald-100 transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-emerald-500 p-2 text-white shadow-sm">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1A1F26]">디지털 주보 관리</p>
                    <p className="text-[10.5px] text-[#64748B]">금주 모바일 주보 수정</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Today's Administration Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-[#64748B]" /> 이번 주 행정 점검 대기
            </h3>
            <div className="bento-card-style p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-900">미입금 확인 헌금 ({unconfirmedOfferings.length}건)</p>
                <p className="text-[10px] text-[#64748B] mt-0.5">온라인 계좌 이체 기탁 후 아직 승인 승낙 처리 대기 중인 항목입니다.</p>
              </div>

              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {unconfirmedOfferings.length > 0 ? (
                  unconfirmedOfferings.map(o => (
                    <div key={o.id} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-gray-900">{o.memberName}</span>
                          <span className="text-[10px] bg-amber-50 text-amber-800 px-1 py-0.2 rounded font-medium">{o.type}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">{o.date} • {o.amount.toLocaleString()}원</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            onVerifyOffering(o.id);
                            onOpenAlimtalk('offering', members.find(m => m.id === o.memberId) || { name: o.memberName, phone: '010-0000-0000' } as Member, o.type, o.amount);
                          }}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-[10px] font-bold text-white transition-all cursor-pointer"
                        >
                          승인 & 톡발송
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 rounded-xl bg-gray-50/50">
                    <p className="text-xs text-gray-400">모든 온라인 헌금 승인이 완료되었습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
