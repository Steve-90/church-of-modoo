/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Member, Visitation, Prayer } from '../types';
import { 
  Heart, Calendar, CheckCircle, Plus, Sparkles, MessageSquare, Clipboard, Search, Check, ThumbsUp
} from 'lucide-react';

interface VisitationAndPrayerProps {
  visitations: Visitation[];
  prayers: Prayer[];
  members: Member[];
  onAddVisitation: (visitation: Visitation) => void;
  onAddPrayer: (prayer: Prayer) => void;
  onPray: (id: string) => void;
  onCompletePrayer: (id: string) => void;
  onOpenAlimtalk: (template: 'general' | 'birthday' | 'offering', member: Member | null) => void;
}

export default function VisitationAndPrayer({
  visitations,
  prayers,
  members,
  onAddVisitation,
  onAddPrayer,
  onPray,
  onCompletePrayer,
  onOpenAlimtalk
}: VisitationAndPrayerProps) {
  // Tabs within this view
  const [activeSubTab, setActiveSubTab] = useState<'prayers' | 'visitations'>('prayers');

  // Search inside prayers
  const [prayerSearch, setPrayerSearch] = useState('');

  // Visitation input form states
  const [visitationMemberId, setVisitationMemberId] = useState('');
  const [visitorName, setVisitorName] = useState('이바울 담임목사님');
  const [visitationDate, setVisitationDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitationContent, setVisitationContent] = useState('');
  const [visitationPrayer, setVisitationPrayer] = useState('');

  // Manual Prayer prompt states
  const [newPrayerMemberId, setNewPrayerMemberId] = useState('');
  const [newPrayerContent, setNewPrayerContent] = useState('');

  // Handle visitation submission
  const handleCreateVisitation = (e: FormEvent) => {
    e.preventDefault();
    if (!visitationMemberId) {
      alert('심방을 받을 성도 이름을 목록에서 선택해 주세요.');
      return;
    }
    if (!visitationContent.trim()) {
      alert('심방 나눔이나 예배 일지 내용을 간략하게 적어 주셔야 기록이 가능합니다.');
      return;
    }

    const m = members.find(member => member.id === visitationMemberId);
    if (!m) return;

    const newV: Visitation = {
      id: `V_${Date.now()}`,
      memberId: visitationMemberId,
      memberName: m.name,
      date: visitationDate,
      visitor: visitorName,
      content: visitationContent,
      prayerRequest: visitationPrayer
    };

    onAddVisitation(newV);

    // If there is a visitation prayer request, automatically propose adding it to the public congregation prayer list!
    if (visitationPrayer.trim()) {
      const autoP: Prayer = {
        id: `P_${Date.now()}`,
        memberId: m.id,
        memberName: m.name,
        content: visitationPrayer,
        createdAt: visitationDate,
        completed: false,
        prayCount: 1
      };
      onAddPrayer(autoP);
      alert('심방 기록 저장 완료!\n성도님이 말씀해주신 기도요청도 [기도제목 피드]에 연동 등록되었습니다.');
    } else {
      alert('심방 기록이 목양 일지에 무사히 보관되었습니다.');
    }

    // Reset fields
    setVisitationContent('');
    setVisitationPrayer('');
  };

  // Handle manual prayer addition
  const handleCreatePrayer = (e: FormEvent) => {
    e.preventDefault();
    if (!newPrayerMemberId) {
      alert('기도제목을 올릴 성도를 선택해 주세요.');
      return;
    }
    if (!newPrayerContent.trim()) {
      alert('기도 간구 내용을 입력해 주세요.');
      return;
    }

    const m = members.find(member => member.id === newPrayerMemberId);
    if (!m) return;

    const newP: Prayer = {
      id: `P_${Date.now()}`,
      memberId: m.id,
      memberName: m.name,
      content: newPrayerContent,
      createdAt: new Date().toISOString().split('T')[0],
      completed: false,
      prayCount: 1
    };

    onAddPrayer(newP);
    setNewPrayerContent('');
    alert('새로운 교구 중보기도 제목이 전 교우에게 공포되었습니다.');
  };

  return (
    <div className="space-y-6" id="visitation-prayer-tab">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            심방 일지 및 중보기도 동참 피드
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            소외되고 아픈 성도를 돌아보며 기도 네트워크를 작동시키는 목양의 소중한 공간입니다.
          </p>
        </div>

        {/* SEGMENTED TAB SWITCHER */}
        <div className="flex bg-gray-100 rounded-xl p-1 shrink-0 mt-3 sm:mt-0 font-semibold text-xs border border-gray-100 shadow-inner">
          <button
            onClick={() => setActiveSubTab('prayers')}
            className={`rounded-lg py-2 px-4 transition-all ${
              activeSubTab === 'prayers'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            중보기도 간구판
          </button>
          <button
            onClick={() => setActiveSubTab('visitations')}
            className={`rounded-lg py-2 px-4 transition-all ${
              activeSubTab === 'visitations'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            교구 심방예배 대장
          </button>
        </div>
      </div>

      {activeSubTab === 'prayers' ? (
        /* PRAYER SECTION */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List of active prayers (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-50">
                <div>
                  <h3 className="font-bold text-gray-950 text-base">중보기도 응원 보드 ({prayers.filter(p => !p.completed).length}건 진행중)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">서로의 무거운 짐을 나누어지고 함께 무릎 꿇는 믿음의 공간입니다.</p>
                </div>
                
                {/* Search in prayers */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={prayerSearch}
                    onChange={(e) => setPrayerSearch(e.target.value)}
                    className="w-[180px] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-250 focus:outline-emerald-600"
                    placeholder="성도명 검색..."
                  />
                </div>
              </div>

              {/* Feed of prayers */}
              <div className="space-y-4 divide-y divide-gray-50">
                {prayers
                  .filter(p => p.memberName.includes(prayerSearch))
                  .map(p => (
                    <div 
                      key={p.id} 
                      className={`pt-4 first:pt-0 flex flex-col sm:flex-row justify-between items-start gap-4 transition-all ${
                        p.completed ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-950">{p.memberName} 성도님</span>
                          <span className="text-[10px] text-gray-400 font-mono">{p.createdAt} 등록</span>
                          {p.completed && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">♥ 기도 응답완료!</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed font-sans">{p.content}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {!p.completed ? (
                          <>
                            <button
                              onClick={() => onPray(p.id)}
                              className="rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-100 px-3.5 py-1 text-xs font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                              <Heart className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse" />
                              <span>아멘, 동참 {p.prayCount}</span>
                            </button>
                            <button
                              onClick={() => onCompletePrayer(p.id)}
                              className="rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-800 p-1.5 cursor-pointer"
                              title="중보기도 응답처리 및 기쁨 나눔"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-emerald-700 font-semibold">하나님께 영광 찬송!</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Quick prayer direct launcher (Right 4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4 h-fit">
            <h3 className="font-bold text-gray-950 text-sm flex items-center gap-1.5 pb-2 border-b border-gray-100">
              <Plus className="h-4.5 w-4.5 text-emerald-600" /> 교구 중보기도 제목 긴급 접수
            </h3>

            <form onSubmit={handleCreatePrayer} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">기도 요청 성도</label>
                <select
                  value={newPrayerMemberId}
                  onChange={(e) => setNewPrayerMemberId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-250 p-2 bg-white focus:outline-emerald-500"
                >
                  <option value="">-- 성도를 선택해 주세요 --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.duty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">기도 및 간구 성명서</label>
                <textarea
                  value={newPrayerContent}
                  onChange={(e) => setNewPrayerContent(e.target.value)}
                  rows={4}
                  className="w-full text-xs rounded-lg border border-gray-250 p-2.5 focus:outline-emerald-500"
                  placeholder="예: 수슬을 앞두고 긴장해 있는 상황입니다. 안전과 주님의 위로가 온 가정에 가득하길 소망합니다..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white shadow-xs transition-transform flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>기도 장부 기입</span>
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* VISITATION COMPONENT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Visitation Diary Logs (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl bg-white border border-gray-150 p-5 space-y-4 shadow-xs">
              <h3 className="font-bold text-gray-950 text-base">역대 심방 예배 일지 목록</h3>
              
              <div className="space-y-4 divide-y divide-gray-100">
                {visitations.map(v => (
                  <div key={v.id} className="pt-4 first:pt-0 space-y-2.5">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">{v.memberName} 성도댁</span>
                        <span className="text-[10.5px] bg-slate-100 text-slate-800 px-2 py-0.2 rounded font-medium">{v.visitor}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono font-bold flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-300" /> {v.date}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50/50 border border-slate-50 p-3 text-xs leading-relaxed text-gray-600">
                      <p className="font-semibold text-gray-700 mb-1 border-b border-gray-100 pb-0.5">■ 나눔과 예배 은혜보고</p>
                      {v.content}
                    </div>

                    {v.prayerRequest && (
                      <div className="rounded-xl bg-amber-50/30 border border-amber-100/50 p-3 text-xs leading-relaxed text-gray-600">
                        <p className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                          <Heart className="h-3 w-3 text-amber-600 fill-amber-500" /> 제출한 심방 기도제목
                        </p>
                        {v.prayerRequest}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New Visitation entry Form (Right 5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-gray-150 bg-white p-5 shadow-xs h-fit space-y-4">
            <h3 className="font-bold text-gray-950 text-sm flex items-center gap-1.5 pb-2 border-b border-gray-100">
              <Clipboard className="h-4.5 w-4.5 text-emerald-600" /> 새로운 심방 예배 기록물 작성
            </h3>

            <form onSubmit={handleCreateVisitation} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">대상 교인 정보</label>
                <select
                  value={visitationMemberId}
                  onChange={(e) => setVisitationMemberId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-250 p-2 bg-white focus:outline-emerald-500"
                  required
                >
                  <option value="">-- 심방 성도 선택 --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.duty} • {m.district})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">심방 사역자</label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-gray-250 p-2 focus:outline-emerald-500"
                    placeholder="사역 사제 성함"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">심방 일시</label>
                  <input
                    type="date"
                    value={visitationDate}
                    onChange={(e) => setVisitationDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-gray-250 p-2 focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">심방 예배 및 상담 내용</label>
                <textarea
                  value={visitationContent}
                  onChange={(e) => setVisitationContent(e.target.value)}
                  rows={4}
                  className="w-full text-xs rounded-lg border border-gray-250 p-2.5 focus:outline-emerald-500 leading-normal"
                  placeholder="예배 설교 핵심 본문, 거실에서 나눈 대화 내용, 건강 및 가정 이목구비 등을 디테일하고 정성스럽게 기록해 두세요."
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5 font-bold text-amber-800">합심 중보 기도 요망사항 (자동 간구판 연동)</label>
                <textarea
                  value={visitationPrayer}
                  onChange={(e) => setVisitationPrayer(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded-lg border border-gray-250 p-2 focus:outline-emerald-500 leading-normal"
                  placeholder="성도가 밝힌 핵심 기도 사안 기입 시 중보기도 간구판에 즉시 실시간 등록 공유됩니다."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                <span>심방 일지 및 예배 결과 대장 저장 완료</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
