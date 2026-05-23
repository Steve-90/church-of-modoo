/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Member, Offering, OfferingType } from '../types';
import { 
  Banknote, Plus, Search, Calendar, CheckSquare, Sparkles, Filter, CheckCircle, Info
} from 'lucide-react';

interface OfferingManagementProps {
  offerings: Offering[];
  members: Member[];
  onAddOffering: (offering: Offering) => void;
  onVerifyOffering: (id: string) => void;
  onOpenAlimtalk: (template: 'general' | 'birthday' | 'offering', member: Member | null, offeringType?: string, amount?: number) => void;
}

export default function OfferingManagement({
  offerings,
  members,
  onAddOffering,
  onVerifyOffering,
  onOpenAlimtalk
}: OfferingManagementProps) {
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedConfirmed, setSelectedConfirmed] = useState('ALL');

  // Input states
  const [memberIdSelection, setMemberIdSelection] = useState('O_ANONYMOUS');
  const [offeringTypeInput, setOfferingTypeInput] = useState<OfferingType>('감사헌금');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [confirmedInput, setConfirmedInput] = useState(true);

  // Constants
  const offeringTypes: OfferingType[] = ['십일조', '감사헌금', '선교헌금', '건축헌금', '주일헌금', '기타'];

  // Total offering calculator
  const filteredOfferings = offerings.filter(o => {
    const matchesSearch = o.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || o.type === selectedType;
    const matchesConfirmed = selectedConfirmed === 'ALL' || 
      (selectedConfirmed === 'CONFIRMED' && o.confirmed) ||
      (selectedConfirmed === 'UNCONFIRMED' && !o.confirmed);

    return matchesSearch && matchesType && matchesConfirmed;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Category Summaries for SVG Charting
  const totalsByType = offeringTypes.reduce((acc, type) => {
    const total = offerings
      .filter(o => o.type === type && o.confirmed)
      .reduce((sum, o) => sum + o.amount, 0);
    acc[type] = total;
    return acc;
  }, {} as { [key: string]: number });

  const totalConfirmedAmount = Object.values(totalsByType).reduce((sum, val) => sum + val, 0);

  // Colors for Custom SVG Charting
  const colorMap: { [key: string]: string } = {
    '십일조': '#10B981', // emerald
    '감사헌금': '#F59E0B', // amber
    '선교헌금': '#3B82F6', // blue
    '건축헌금': '#8B5CF6', // purple
    '주일헌금': '#EC4899', // pink
    '기타': '#6B7280' // gray
  };

  const handleCreateOfferingSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amountInput.replace(/,/g, ''), 10);
    if (!parsedAmount || parsedAmount <= 0) {
      alert('유효한 헌금 금액을 숫자로 정확하게 기입해 주세요.');
      return;
    }

    let resolvedName = '무명(직접입금)';
    if (memberIdSelection !== 'O_ANONYMOUS') {
      const found = members.find(m => m.id === memberIdSelection);
      if (found) resolvedName = found.name;
    }

    const created: Offering = {
      id: `O_${Date.now()}`,
      date: dateInput,
      memberId: memberIdSelection,
      memberName: resolvedName,
      type: offeringTypeInput,
      amount: parsedAmount,
      confirmed: confirmedInput
    };

    onAddOffering(created);
    
    // Reset text fields
    setAmountInput('');
    alert('귀한 예물 기록이 장부에 반영되었습니다.');

    // If confirmed, allow quick receipt notification dispatch
    if (confirmedInput && memberIdSelection !== 'O_ANONYMOUS') {
      const targetM = members.find(m => m.id === memberIdSelection) || null;
      if (targetM && confirm(`${targetM.name} 성도님에게 즉시 감사 알림톡을 예약/전송하시겠습니까?`)) {
        onOpenAlimtalk('offering', targetM, offeringTypeInput, parsedAmount);
      }
    }
  };

  return (
    <div className="space-y-6" id="offering-management-tab">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          재정 관리 및 헌금 내역 장부 <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">확정 {totalConfirmedAmount.toLocaleString()}원</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          교회 헌금 기입 자동화 시뮬레이션 및 입금 확인을 거쳐 카카오 알림톡 감사 메시지와 원스톱 연계됩니다.
        </p>
      </div>

      {/* SVG CHART & STATS ROW */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* SVG Distribution Ratio graphic chart (6 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-100 bg-white p-5 flex flex-col md:flex-row justify-between items-center gap-5 shadow-xs">
          <div className="w-[170px] h-[170px] relative flex items-center justify-center shrink-0">
            {/* Custom SVG Donut slice chart */}
            <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="4.5" />
              {(() => {
                let accumulatedPercent = 0;
                return offeringTypes.map((type, idx) => {
                  const amount = totalsByType[type] || 0;
                  if (amount === 0 || totalConfirmedAmount === 0) return null;
                  const pct = (amount / totalConfirmedAmount) * 100;
                  const strokeDasharray = `${pct} ${100 - pct}`;
                  const strokeDashoffset = 100 - accumulatedPercent;
                  accumulatedPercent += pct;
                  
                  return (
                    <circle
                      key={idx}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke={colorMap[type]}
                      strokeWidth="4.5"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-gray-400 font-bold uppercase">5월 총 예물</span>
              <span className="text-sm font-extrabold text-charcoal">{totalConfirmedAmount > 1000000 ? `${(totalConfirmedAmount/10000).toLocaleString()}만` : totalConfirmedAmount.toLocaleString()}원</span>
            </div>
          </div>

          {/* Chart Legends with numbers and ratio percent */}
          <div className="flex-1 space-y-2 w-full">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">분류별 예물 통계비율</h4>
            <div className="grid grid-cols-2 gap-2">
              {offeringTypes.map(type => {
                const amount = totalsByType[type] || 0;
                const pct = totalConfirmedAmount > 0 ? Math.round((amount / totalConfirmedAmount) * 100) : 0;
                return (
                  <div key={type} className="rounded-lg border border-gray-50 p-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorMap[type] }} />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-semibold">{type}</p>
                      <p className="text-xs font-bold text-gray-800 tracking-tight leading-normal">
                        {amount.toLocaleString()}원 <span className="text-[10px] font-normal text-emerald-600">({pct}%)</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic ledger adding form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-amber-100 bg-amber-50/10 p-5 shadow-xs">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 pb-2 border-b border-amber-100/30">
            <Plus className="h-4.5 w-4.5 text-amber-600" /> 수동 신규 헌금 기록 기입
          </h3>

          <form onSubmit={handleCreateOfferingSubmit} className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">봉헌 성도</label>
                <select
                  value={memberIdSelection}
                  onChange={(e) => setMemberIdSelection(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 p-2 bg-white focus:outline-emerald-500"
                >
                  <option value="O_ANONYMOUS">무명 (직접입금)</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.duty})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">예물 구분</label>
                <select
                  value={offeringTypeInput}
                  onChange={(e) => setOfferingTypeInput(e.target.value as OfferingType)}
                  className="w-full text-xs rounded-lg border border-gray-200 p-2 bg-white focus:outline-emerald-500"
                >
                  {offeringTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">봉헌 일자</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 p-2 focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">봉헌 금액 (원화)</label>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => {
                    // Filter numbers only
                    const num = e.target.value.replace(/[^0-9]/g, '');
                    setAmountInput(num ? parseInt(num, 10).toLocaleString() : '');
                  }}
                  placeholder="예: 100,000"
                  className="w-full text-xs rounded-lg border border-gray-200 p-2 focus:outline-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedInput}
                  onChange={(e) => setConfirmedInput(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                />
                <span className="font-semibold">은행 입금 대사 즉시 확인 및 전산 통계 반영</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>장부 추가 완료 & 승인</span>
            </button>
          </form>
        </div>

      </section>

      {/* SEARCH AND FILTER TOOLS */}
      <section className="rounded-2xl border border-gray-150 bg-white p-4 flex flex-col md:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-250 focus:outline-emerald-600"
            placeholder="성도 이름 교인 대조 검색..."
          />
        </div>
        <div className="flex gap-2.5">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs rounded-lg border border-gray-250 px-2 py-2 bg-white"
          >
            <option value="ALL">전체 예물 항목</option>
            {offeringTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={selectedConfirmed}
            onChange={(e) => setSelectedConfirmed(e.target.value)}
            className="text-xs rounded-lg border border-gray-250 px-2 py-2 bg-white"
          >
            <option value="ALL">전체 정산 구분</option>
            <option value="CONFIRMED">정산 승인 완료</option>
            <option value="UNCONFIRMED">정산 대기중</option>
          </select>
        </div>
      </section>

      {/* OFFERING DETAILS LIST */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold text-gray-500">
                <th className="px-6 py-3">정산ID</th>
                <th className="px-6 py-3">봉헌 일자</th>
                <th className="px-6 py-3">성함 (성도 ID)</th>
                <th className="px-6 py-3">헌금 구분</th>
                <th className="px-6 py-3">봉헌 액수</th>
                <th className="px-6 py-3">입금 정산 여부</th>
                <th className="px-6 py-3 text-right">감사 알림 시뮬레이션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {filteredOfferings.map(o => (
                <tr key={o.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-gray-400">{o.id}</td>
                  <td className="px-6 py-3.5 font-mono">{o.date}</td>
                  <td className="px-6 py-3.5">
                    <span className="font-bold text-gray-900">{o.memberName}</span>
                    <span className="text-gray-400 text-[10px] ml-1">({o.memberId})</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span 
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ 
                        color: colorMap[o.type], 
                        backgroundColor: `${colorMap[o.type]}10` 
                      }}
                    >
                      {o.type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-bold font-mono text-gray-900">{o.amount.toLocaleString()}원</td>
                  <td className="px-6 py-3.5">
                    {o.confirmed ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 text-[10.5px]">
                        <CheckCircle className="h-4 w-4" /> 입금 확인 완료
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onVerifyOffering(o.id);
                          onOpenAlimtalk('offering', members.find(m => m.id === o.memberId) || { name: o.memberName, phone: '010-0000-0000' } as Member, o.type, o.amount);
                        }}
                        className="rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 py-1 text-[10px] font-bold text-white transition-all cursor-pointer shadow-xs"
                      >
                        정산 미확정 (대사하기)
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {o.memberId !== 'O_ANONYMOUS' ? (
                      <button
                        onClick={() => onOpenAlimtalk('offering', members.find(m => m.id === o.memberId) || null, o.type, o.amount)}
                        className="text-xs text-emerald-700 hover:underline font-bold"
                      >
                        알림톡 재발송
                      </button>
                    ) : (
                      <span className="text-gray-400 text-[10px]">비성도(무기명) 발송불가</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* compliance guidelines banner */}
      <div className="rounded-xl border border-gray-150 p-4 bg-gray-50 flex gap-2.5 items-start">
        <Info className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-500 leading-normal">
          <p className="font-bold text-gray-700">기부금 영수증 연동 및 세무 투명성 가이드</p>
          <p className="mt-0.5">본 교회 행정 장부는 국세청 연말정산 간소화 기부금(헌금) 증빙 자료와 데이터 정합성이 100% 동기화되도록 설계되었습니다. 입금 미확정 항목 정산 대사 진행 시 해당 교인에게 카카오 알림톡으로 실시간 증빙 서류가 자동 전달됩니다.</p>
        </div>
      </div>

    </div>
  );
}
