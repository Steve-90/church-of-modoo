/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Bulletin, Announcement, WorshipStep, ChurchConfig } from '../types';
import { 
  Clipboard, Phone, Smartphone, Edit, Plus, Trash, Check, Sparkles, Copy, Share2
} from 'lucide-react';

interface DigitalBulletinProps {
  bulletin: Bulletin;
  onUpdateBulletin: (bulletin: Bulletin) => void;
  onOpenAlimtalk: (template: 'general' | 'birthday' | 'offering', member: null) => void;
  churchConfig?: ChurchConfig;
}

export default function DigitalBulletin({
  bulletin,
  onUpdateBulletin,
  onOpenAlimtalk,
  churchConfig
}: DigitalBulletinProps) {
  // Local edit states
  const [date, setDate] = useState(bulletin.date);
  const [title, setTitle] = useState(bulletin.title);
  const [preacher, setPreacher] = useState(bulletin.preacher);
  const [scripture, setScripture] = useState(bulletin.scripture);
  
  // Lists
  const [outlines, setOutlines] = useState<string[]>(bulletin.sermonOutline);
  const [announcements, setAnnouncements] = useState<Announcement[]>(bulletin.announcements);
  const [worshipOrder, setWorshipOrder] = useState<WorshipStep[]>(bulletin.worshipOrder);

  // Outline manipulators
  const [newOutlineInput, setNewOutlineInput] = useState('');
  const handleAddOutline = () => {
    if (!newOutlineInput.trim()) return;
    const next = [...outlines, newOutlineInput.trim()];
    setOutlines(next);
    setNewOutlineInput('');
    triggerUpdate(next, announcements, worshipOrder);
  };
  const handleRemoveOutline = (idx: number) => {
    const next = outlines.filter((_, i) => i !== idx);
    setOutlines(next);
    triggerUpdate(next, announcements, worshipOrder);
  };

  // Announcement manipulators
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const handleAddAnnouncement = () => {
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    const newAnn: Announcement = {
      id: `A_${Date.now()}`,
      title: newAnnTitle.trim(),
      content: newAnnContent.trim()
    };
    const next = [...announcements, newAnn];
    setAnnouncements(next);
    setNewAnnTitle('');
    setNewAnnContent('');
    triggerUpdate(outlines, next, worshipOrder);
  };
  const handleRemoveAnn = (id: string) => {
    const next = announcements.filter(a => a.id !== id);
    setAnnouncements(next);
    triggerUpdate(outlines, next, worshipOrder);
  };

  // Worship order manipulators
  const [newStepName, setNewStepName] = useState('');
  const [newStepPerson, setNewStepPerson] = useState('');
  const handleAddWorshipStep = () => {
    if (!newStepName.trim() || !newStepPerson.trim()) return;
    const next = [...worshipOrder, { name: newStepName.trim(), person: newStepPerson.trim() }];
    setWorshipOrder(next);
    setNewStepName('');
    setNewStepPerson('');
    triggerUpdate(outlines, announcements, next);
  };
  const handleRemoveWorshipStep = (idx: number) => {
    const next = worshipOrder.filter((_, i) => i !== idx);
    setWorshipOrder(next);
    triggerUpdate(outlines, announcements, next);
  };

  // Core update save
  const triggerUpdate = (
    curOutlines = outlines,
    curAnnouncements = announcements,
    curWorshipOrder = worshipOrder
  ) => {
    onUpdateBulletin({
      date,
      title,
      preacher,
      scripture,
      sermonOutline: curOutlines,
      announcements: curAnnouncements,
      worshipOrder: curWorshipOrder
    });
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const handleCopyLink = () => {
    const mockUrl = `https://eunhae-church.net/bulletin/${date}`;
    navigator.clipboard.writeText(mockUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6" id="digital-bulletin-tab">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            실시간 디지털 모바일 주보 편집자 (Vite-Sync)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            왼쪽에서 주보 텍스트를 고치면 오른쪽의 스마트폰 모형 주보 앱에 실시간으로 즉시 렌더링 동기화 됩니다.
          </p>
        </div>
        <div className="flex gap-2.5 mt-3 sm:mt-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 cursor-pointer shadow-xs transition-colors"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copiedLink ? '복사 완료!' : '주보 전용단축 링크복사'}</span>
          </button>
          
          <button
            onClick={() => onOpenAlimtalk('general', null)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-650 hover:bg-emerald-750 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>주일주보 알림톡 공유 발송</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* EDITING FORMS GRID (Left 7 cols) */}
        <section className="lg:col-span-7 space-y-5">
          
          {/* Base details CARD */}
          <div className="rounded-2xl border border-gray-150 bg-white p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-gray-950 text-sm border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <Edit className="h-4 w-4 text-emerald-650" /> 금주 대예배 주제 말씀 설정
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase">예배 날짜 (주일)</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); triggerUpdate(); }}
                  className="mt-1 w-full text-xs rounded-lg border border-gray-250 p-2.5 focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase">설교 메시지 사제</label>
                <input
                  type="text"
                  value={preacher}
                  onChange={(e) => { setPreacher(e.target.value); triggerUpdate(); }}
                  className="mt-1 w-full text-xs rounded-lg border border-gray-250 p-2.5 focus:outline-emerald-500"
                  placeholder="예: 이바울 목사"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase">주일 설교 주제 제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); triggerUpdate(); }}
                  className="mt-1 w-full text-xs rounded-lg border border-gray-250 p-2.5 focus:outline-emerald-500 font-bold"
                  placeholder="제목 입력"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase">예배 본문 말씀 (성경 구절)</label>
                <input
                  type="text"
                  value={scripture}
                  onChange={(e) => { setScripture(e.target.value); triggerUpdate(); }}
                  className="mt-1 w-full text-xs rounded-lg border border-gray-250 p-2.5 focus:outline-emerald-500 font-bold"
                  placeholder="예: 마태복음 5:3~10"
                />
              </div>
            </div>
          </div>

          {/* Sermon Outline builder CARD */}
          <div className="rounded-2xl border border-gray-150 bg-white p-5 space-y-3.5 shadow-xs">
            <h3 className="font-bold text-gray-950 text-sm border-b border-gray-50 pb-2">설교 핵심 요약 / 대지 구성 ({outlines.length}개)</h3>
            <div className="space-y-2">
              {outlines.map((out, idx) => (
                <div key={idx} className="flex justify-between items-center rounded-lg bg-gray-50 p-2 border border-gray-50">
                  <span className="text-xs font-medium text-gray-700">{out}</span>
                  <button onClick={() => handleRemoveOutline(idx)} className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer">
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2.5 pt-1">
              <input
                type="text"
                value={newOutlineInput}
                onChange={(e) => setNewOutlineInput(e.target.value)}
                className="flex-1 text-xs rounded-lg border border-gray-250 p-2 focus:outline-emerald-500"
                placeholder="새로운 설교 대지 내용 기입..."
              />
              <button
                type="button"
                onClick={handleAddOutline}
                className="h-9 px-3.5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-750 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> 추가
              </button>
            </div>
          </div>

          {/* Worship order steps editor CARD */}
          <div className="rounded-2xl border border-gray-150 bg-white p-5 space-y-3.5 shadow-xs">
            <h3 className="font-bold text-gray-950 text-sm border-b border-gray-50 pb-2">예배 시무 순서 조율 ({worshipOrder.length}단절)</h3>
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1.5">
              {worshipOrder.map((step, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-xs leading-normal">
                  <div>
                    <span className="font-bold text-gray-950">{step.name}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-gray-500 font-semibold">{step.person}</span>
                  </div>
                  <button onClick={() => handleRemoveWorshipStep(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer">
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                className="text-xs rounded-lg border border-gray-250 p-2"
                placeholder="순서명 (예: 대표 기도)"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStepPerson}
                  onChange={(e) => setNewStepPerson(e.target.value)}
                  className="flex-1 text-xs rounded-lg border border-gray-250 p-2"
                  placeholder="인도자 (예: 김동선 장로)"
                />
                <button
                  type="button"
                  onClick={handleAddWorshipStep}
                  className="rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-750 flex items-center justify-center cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Announcements CARD */}
          <div className="rounded-2xl border border-gray-150 bg-white p-5 space-y-3.5 shadow-xs">
            <h3 className="font-bold text-gray-950 text-sm border-b border-gray-50 pb-2">공지사항 및 알림록 배포판 목록 ({announcements.length}개)</h3>
            <div className="space-y-3 pr-1">
              {announcements.map((ann) => (
                <div key={ann.id} className="rounded-xl border border-gray-150 p-3 bg-gray-50/50 space-y-1 relative">
                  <h4 className="font-bold text-xs text-gray-900 pr-8">{ann.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-normal font-medium">{ann.content}</p>
                  <button
                    onClick={() => handleRemoveAnn(ann.id)}
                    className="absolute right-2 top-2 p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <input
                type="text"
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-250 p-2 focus:outline-emerald-500"
                placeholder="공지 대문 (예: 상반기 성경대학 개강)"
              />
              <div className="flex gap-2.5">
                <textarea
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  rows={2}
                  className="flex-1 text-xs rounded-lg border border-gray-250 p-2 focus:outline-emerald-500 font-sans leading-normal"
                  placeholder="세부 교육 일정 및 장소 입력..."
                />
                <button
                  type="button"
                  onClick={handleAddAnnouncement}
                  className="w-16 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-750 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

        </section>

        {/* SMARTPHONE PREVIEW FRAME (Right 5 cols) */}
        <section className="lg:col-span-5 flex flex-col items-center">
          
          <div className="sticky top-5 w-full max-w-[340px]">
            <span className="mb-2 block font-bold text-xs text-gray-400 text-center uppercase tracking-wider">
              모바일 전용 주보 미리보기 실시간 반영
            </span>

            {/* Simulated smartphone frame Container */}
            <div className="w-full rounded-[40px] border-[12px] border-neutral-900 bg-neutral-950 overflow-hidden shadow-2xl relative min-h-[580px] max-h-[610px] flex flex-col">
              
              {/* Camera Notch and status line */}
              <div className="bg-neutral-950 py-1.5 flex justify-center shrink-0">
                <div className="w-24 h-4 bg-black rounded-b-xl absolute top-0 z-20" />
                <div className="w-full flex justify-between items-center px-6 text-[9.5px] text-neutral-400 font-bold tracking-tight">
                  <span>9:41</span>
                  <span>5G • 100%</span>
                </div>
              </div>

              {/* Mobile View Screen content */}
              <div className="flex-1 overflow-y-auto bg-warm-white/10 bg-[#FAF9F5] select-none text-gray-800 font-sans p-4.5 space-y-5 scrollbar-none">
                
                {/* Church Header Banner */}
                <div className="text-center space-y-1 py-4 border-b-2 border-double border-emerald-900/30">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                    {churchConfig?.denomination ? `${churchConfig.denomination} ` : ''}{churchConfig?.name || '은혜교회'}
                  </span>
                  <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">주일 모바일 예배 주보</h1>
                  <p className="text-[10.5px] font-mono text-gray-400 font-bold">{date}</p>
                </div>

                {/* Sermon Section banner */}
                <div className="text-center rounded-2xl bg-[#EBE9E1] p-4 border border-[#DFDDD5] space-y-1.5">
                  <span className="text-[10px] bg-emerald-800 text-white rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider block w-fit mx-auto">오늘의 대주일 설교</span>
                  <p className="text-xs text-gray-500 font-semibold">{preacher}</p>
                  <h2 className="font-extrabold text-sm text-gray-900 mb-1 leading-normal">"{title}"</h2>
                  <p className="text-[11px] font-bold text-emerald-900 leading-normal border-t border-gray-200/55 pt-1.5 mt-1.5 font-mono bg-white/20 rounded py-0.5">
                    말씀 : {scripture}
                  </p>
                </div>

                {/* Sermon outlines list */}
                {outlines.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider block border-l-3 border-emerald-800 pl-1.5">설교 묵상 대목 요지</span>
                    <div className="rounded-xl bg-white p-3 border border-gray-100 shadow-xs space-y-2 text-xs text-gray-700 leading-relaxed font-semibold">
                      {outlines.map((out, idx) => (
                        <p key={idx} className="border-b last:border-b-0 border-gray-50 pb-1.5 last:pb-0 font-sans">
                          {out}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Worship items flow */}
                <div className="space-y-2.5">
                  <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider block border-l-3 border-emerald-800 pl-1.5">예배 순서 안내</span>
                  <div className="rounded-xl bg-white border border-gray-100 shadow-xs divide-y divide-gray-50 text-[11px]">
                    {worshipOrder.map((step, idx) => (
                      <div key={idx} className="flex justify-between items-center px-3.5 py-2.5 font-semibold text-gray-750">
                        <span>{step.name}</span>
                        <span className="text-gray-400 font-normal">{step.person}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Announcements module */}
                <div className="space-y-2.5">
                  <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider block border-l-3 border-emerald-800 pl-1.5">부서 소식 및 공지</span>
                  <div className="space-y-2.5">
                    {announcements.map((ann, idx) => (
                      <div key={ann.id} className="rounded-xl bg-[#F0EEE6] border border-[#E3E1D7] p-3 text-[11px] leading-relaxed">
                        <h4 className="font-extrabold text-gray-900 mb-0.5">{idx + 1}. {ann.title}</h4>
                        <p className="text-gray-600 font-medium">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Giving shortcut mock block */}
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center text-xs space-y-1 text-emerald-900">
                  <p className="font-bold">계좌이체 헌금 및 소통마당</p>
                  <p className="text-[10px] text-emerald-700">신한 100-200-3000 {churchConfig?.name || '은혜'}재정부</p>
                </div>

                <div className="pt-2 pb-6 text-center text-[9px] text-gray-400 border-t border-gray-200/60 leading-normal">
                  본 모바일 주보는 친환경 탄소중립 종이 아끼기 서약 목적으로 {churchConfig?.name || '은혜교회'} 사무국에서 디지털 제작되었습니다.
                </div>

              </div>

              {/* White Bar on Bottom Home button */}
              <div className="py-2.5 bg-neutral-950 flex justify-center shrink-0">
                <div className="w-28 h-1 bg-white rounded-full" />
              </div>
            </div>

          </div>
        </section>

      </div>

    </div>
  );
}
