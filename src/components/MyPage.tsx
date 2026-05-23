/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { Member, Offering, Prayer, Bulletin, OfferingType, ChurchConfig } from '../types';
import { 
  User, CheckCircle, Clock, Heart, Banknote, Smartphone, Edit3, Send, ShieldAlert, Award,
  BookOpen, Calendar, HelpCircle, UserCheck, PlusCircle, ArrowRight
} from 'lucide-react';

interface MyPageProps {
  members: Member[];
  offerings: Offering[];
  prayers: Prayer[];
  bulletin: Bulletin;
  onUpdateMember: (member: Member) => void;
  onAddPrayer: (prayer: Prayer) => void;
  onAddOffering: (offering: Offering) => void;
  churchConfig?: ChurchConfig;
}

export default function MyPage({
  members,
  offerings,
  prayers,
  bulletin,
  onUpdateMember,
  onAddPrayer,
  onAddOffering,
  churchConfig
}: MyPageProps) {
  // Mock login - select which member we are logged in as
  const [activeLoginId, setActiveLoginId] = useState<string>('M001'); // Defaults to M001 (Kim EunHye)
  const currentMember = members.find(m => m.id === activeLoginId) || members[0];

  // Self attendance check state
  const targetServiceDate = '2026-05-24'; // The next Sunday
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);

  // Self profile edit state
  const [isEditingSelf, setIsEditingSelf] = useState(false);
  const [selfName, setSelfName] = useState('');
  const [selfPhone, setSelfPhone] = useState('');
  const [selfBirthDate, setSelfBirthDate] = useState('');

  // Self prayer request form state
  const [addPrayerText, setAddPrayerText] = useState('');

  // Send Offering state
  const [sendOfferingType, setSendOfferingType] = useState<OfferingType>('십일조');
  const [sendOfferingAmount, setSendOfferingAmount] = useState<number>(30000);
  const [offeringMessage, setOfferingMessage] = useState<string>('');

  // Sync internal state with currently selected logged-in member
  useEffect(() => {
    if (currentMember) {
      setSelfName(currentMember.name);
      setSelfPhone(currentMember.phone);
      setSelfBirthDate(currentMember.birthDate);
      setAttendanceSuccess(currentMember.attendance[targetServiceDate] === true);
    }
  }, [activeLoginId, currentMember]);

  // Self attendance check action
  const handleSelfAttendanceCheck = () => {
    if (!currentMember) return;
    
    // Update attendance locally in global store
    const updatedMember: Member = {
      ...currentMember,
      attendance: {
        ...currentMember.attendance,
        [targetServiceDate]: true
      }
    };

    onUpdateMember(updatedMember);
    setAttendanceSuccess(true);

    // Show beautiful success prompt
    alert(`[모바일 출석 성공] ${currentMember.name} 성도님, ${targetServiceDate} 주일 대예배 출석 체크가 정상 처리되었습니다! 공금 장부에 실시간 기록되었습니다.`);
  };

  // Profile update submit
  const handleProfileUpdateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentMember) return;

    const updated: Member = {
      ...currentMember,
      name: selfName,
      phone: selfPhone,
      birthDate: selfBirthDate
    };

    onUpdateMember(updated);
    setIsEditingSelf(false);
    alert('개인정보 및 교적 사항이 국세청 보안 대조용 암호화 통신으로 업데이트 완료되었습니다!');
  };

  // Prayer submit
  const handleAddPrayerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!addPrayerText.trim()) return;

    const newP: Prayer = {
      id: `P_${Date.now()}`,
      memberId: currentMember.id,
      memberName: currentMember.name,
      content: addPrayerText.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      completed: false,
      prayCount: 1
    };

    onAddPrayer(newP);
    setAddPrayerText('');
    alert('제출된 성도님의 기도제목이 목장실 및 담임 수석 교목 기도대에 실시간 등재 완료되었습니다!');
  };

  // Send offering submit
  const handleSendOfferingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (sendOfferingAmount <= 0) {
      alert('바른 헌금 금액을 전산 기입해주십시오.');
      return;
    }

    const newOffering: Offering = {
      id: `O_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      memberId: currentMember.id,
      memberName: currentMember.name,
      type: sendOfferingType,
      amount: sendOfferingAmount,
      confirmed: false
    };

    onAddOffering(newOffering);
    setSendOfferingAmount(30000);
    setOfferingMessage('');
    alert(`[감사 봉헌 성공] 감사와 찬양을 드리며, ${currentMember.name} 성도님의 ${sendOfferingType} (${sendOfferingAmount.toLocaleString()}원)이 전송되었습니다. 재정부 최종 승인 대조 과정을 실시간 개시합니다.`);
  };

  // Handy shortcut triggers to incremental offering values
  const addOfferingMoney = (amount: number) => {
    setSendOfferingAmount(prev => Math.max(0, prev + amount));
  };

  // Gather only matching user prayers
  const myPrayers = prayers.filter(p => p.memberId === currentMember.id);

  return (
    <div className="space-y-6" id="member-mypage-tab">
      
      {/* AUTHENTICATION SIMULATION BADGER BAR */}
      <div className="rounded-2xl border border-blue-150 bg-blue-50/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex gap-2.5 items-start">
          <Award className="h-5.5 w-5.5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">교인 본인 인증 시뮬레이션</span>
            <h3 className="text-sm font-bold text-gray-900 mt-0.5">성도 스마트폰에서 접속한 안전 마이페이지 가상체험</h3>
          </div>
        </div>

        {/* select login target member */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold shrink-0">가상 로그인 성도 선택:</span>
          <select
            value={activeLoginId}
            onChange={(e) => setActiveLoginId(e.target.value)}
            className="text-xs rounded-lg border border-gray-250 p-2.5 bg-white font-bold text-gray-800 focus:outline-blue-500"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.duty} • {m.district})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT COLUMN (8 cols) */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Attendance Check-in action card */}
          <div className="bento-card-style p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] tag-badge tag-new">5월 24일 주일 대예배</span>
                <h3 className="font-extrabold text-lg text-gray-950 mt-1.5 flex items-center gap-1.5">
                  간편 모바일 전자 출석 체크
                </h3>
                <p className="text-xs text-gray-450 mt-1 leading-normal">
                  주일 예배 본당 입장 시, 또는 온라인 비대면 실시간 예배 참석 시 아래 버튼을 터치하시면 자동으로 출석 처리가 마감됩니다.
                </p>
              </div>
              <Clock className="h-9 w-9 text-[#3B82F6] shrink-0 opacity-55" />
            </div>

            <div className="pt-2">
              {attendanceSuccess ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-4 text-center text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
                  <CheckCircle className="h-5.5 w-5.5 text-emerald-600 fill-white" />
                  <span>{currentMember.name} 성도님, 주일 출석 체크 완료! (교회 행정 전산망에 기입됨)</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSelfAttendanceCheck}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-99 text-sm font-bold text-white py-3.5 px-5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <UserCheck className="h-5 w-5 animate-bounce" />
                  <span>{churchConfig?.name || '은혜교회'} 실시간 주일 대예배 출석 체크하기</span>
                </button>
              )}
            </div>
          </div>

          {/* NEW: 주보내용 & 금주 본문말씀 INTEGRATED BENTO CARD */}
          <div className="bento-card-style p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#3B82F6]" />
                <h3 className="font-extrabold text-base text-gray-900">금주 디지털 주보 및 본문말씀</h3>
              </div>
              <span className="text-xs bg-slate-100/80 text-slate-600 px-2.5 py-1 rounded-full font-bold">5월 24일자 주야 성전</span>
            </div>

            {/* 본문말씀 Highlight block */}
            <div className="rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFC] p-5 border border-[#EFF6FF] space-y-3">
              <div>
                <span className="text-[10px] tracking-widest font-extrabold uppercase text-[#3B82F6]">📖 금주 말씀 본문</span>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{bulletin.scripture}</p>
              </div>
              <div className="border-t border-blue-100/50 pt-3">
                <h4 className="text-base font-extrabold text-gray-900 leading-normal font-sans">
                  " {bulletin.title} "
                </h4>
                <p className="text-xs font-bold text-slate-600 mt-1">
                  설교 : {bulletin.preacher} 수석 목사
                </p>
              </div>
              <div className="pt-2 text-xs text-slate-600 leading-relaxed font-serif italic border-l-2 border-[#3B82F6] pl-3 py-1 bg-white/70 rounded-r-lg">
                성도여러분을 위해 주일 본당에서 선포될 영광의 생명수 말씀 양식을 묵상하십시오.
              </div>
            </div>

            {/* Worship process table */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#64748B] tracking-wider uppercase block">예배의 순서 (주보내용)</span>
              <div className="rounded-xl border border-[#E2E8F0] overflow-hidden whitespace-normal">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-bold">
                    <tr>
                      <th className="px-4 py-2.5">순서</th>
                      <th className="px-4 py-2.5">내용 및 담당</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulletin.worshipOrder && bulletin.worshipOrder.map((step, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-slate-600">{step.name}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{step.person || '다함께'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Church notices */}
            {bulletin.announcements && bulletin.announcements.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#64748B] tracking-wider uppercase block">교회 알림 및 광고 사항</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bulletin.announcements.map((ann, idx) => (
                    <div key={idx} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 flex gap-2.5">
                      <span className="text-[#3B82F6] font-extrabold text-xs shrink-0 mt-0.5">📢</span>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{ann.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ann.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile information section */}
          <div className="bento-card-style p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3.5">
              <div>
                <h4 className="font-extrabold text-gray-950 text-base">개인 교적부 신원 확인 및 수정</h4>
                <p className="text-xs text-gray-400 mt-0.5">교회 행정 보안 관리 조항에 근거하여 본인 세례등급 및 연락처만 관리 가능합니다.</p>
              </div>
              
              {!isEditingSelf && (
                <button
                  onClick={() => setIsEditingSelf(true)}
                  className="text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200"
                >
                  <Edit3 className="h-3.5 w-3.5" /> 나의 프로필 수정
                </button>
              )}
            </div>

            {!isEditingSelf ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-5 text-xs text-slate-700">
                <div>
                  <span className="text-[#94A3B8] block pb-0.5 font-bold uppercase tracking-wider text-[10px]">교적 성함</span>
                  <span className="text-sm font-extrabold text-slate-900">{currentMember.name} ({currentMember.duty})</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block pb-0.5 font-bold uppercase tracking-wider text-[10px]">휴대폰 연락처</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{currentMember.phone}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block pb-0.5 font-bold uppercase tracking-wider text-[10px]">교인 소속 및 구역</span>
                  <span className="text-sm font-semibold text-slate-900">{currentMember.district}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block pb-0.5 font-bold uppercase tracking-wider text-[10px]">세례 최종등급</span>
                  <span className="text-sm font-bold text-[#10B981]">{currentMember.baptism}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block pb-0.5 font-bold uppercase tracking-wider text-[10px]">세무 대조 생년월일</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">{currentMember.birthDate}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block pb-0.5 font-bold uppercase tracking-wider text-[10px]">가족 세세대 ID</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">{currentMember.familyId || '독립 세대'}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-650 block mb-1">성도 이름 명시</label>
                    <input
                      type="text"
                      value={selfName}
                      onChange={(e) => setSelfName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-250 p-2.5 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-650 block mb-1">휴대 연락처</label>
                    <input
                      type="text"
                      value={selfPhone}
                      onChange={(e) => setSelfPhone(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-250 p-2.5 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-650 block mb-1">세무 정산용 생년월일</label>
                  <input
                    type="date"
                    value={selfBirthDate}
                    onChange={(e) => setSelfBirthDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-250 p-2.5 bg-white"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingSelf(false)}
                    className="text-xs rounded-lg border border-slate-250 px-3.5 py-2 bg-white text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="text-xs rounded-lg bg-[#3B82F6] text-white font-extrabold px-5 py-2 hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                  >
                    교적 저장하기
                  </button>
                </div>
              </form>
            )}
          </div>

        </section>

        {/* RIGHT SYSTEM COLUMN (4 cols) */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* NEW MODULE: 모바일 헌금 보내기 (헌금 보내기 새 기능) */}
          <div className="bento-card-style p-6 space-y-4">
            <div>
              <span className="text-[10px] tag-badge tag-birthday flex items-center gap-1 w-max">
                <PlusCircle className="h-3 w-3 inline" /> 실시간 무선 복지 봉헌
              </span>
              <h3 className="font-extrabold text-slate-950 text-base mt-1.5 flex items-center gap-1.5">
                <Banknote className="h-5 w-5 text-amber-600" /> 모바일 헌금 보내기
              </h3>
              <p className="text-[10.5px] text-slate-500 leading-normal mt-1">
                계좌 대조용 전산 봉헌 접수 기능입니다. 희망하시는 헌금 항목과 작정 금액을 전송해 주십시오.
              </p>
            </div>

            <form onSubmit={handleSendOfferingSubmit} className="space-y-4 pt-1">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">헌금 종류 선택</label>
                <select
                  value={sendOfferingType}
                  onChange={(e) => setSendOfferingType(e.target.value as OfferingType)}
                  className="w-full text-xs rounded-lg border border-slate-250 p-2.5 bg-white font-bold text-slate-700"
                >
                  <option value="십일조">십일조 (Tithe)</option>
                  <option value="감사헌금">감사헌금</option>
                  <option value="선교헌금">선교헌금</option>
                  <option value="건축헌금">건축헌금</option>
                  <option value="주일헌금">주일헌금</option>
                  <option value="기타">기타 특별 작정</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">예물 봉헌 액수 (원)</label>
                <input
                  type="number"
                  value={sendOfferingAmount}
                  onChange={(e) => setSendOfferingAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full text-xs rounded-lg border border-slate-250 p-2.5 bg-white font-extrabold font-mono text-slate-900 text-right focus:outline-blue-500"
                  placeholder="예: 50,000"
                  required
                />
                
                {/* Handy quick amount adjustment calculators */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => addOfferingMoney(10000)}
                    className="text-[10px] py-1 border border-slate-200 rounded-md bg-slate-50 hover:bg-slate-100 font-bold text-slate-600 transition-colors"
                  >
                    +1만
                  </button>
                  <button
                    type="button"
                    onClick={() => addOfferingMoney(50000)}
                    className="text-[10px] py-1 border border-slate-200 rounded-md bg-slate-50 hover:bg-slate-100 font-bold text-slate-600 transition-colors"
                  >
                    +5만
                  </button>
                  <button
                    type="button"
                    onClick={() => addOfferingMoney(100000)}
                    className="text-[10px] py-1 border border-slate-200 rounded-md bg-slate-50 hover:bg-slate-100 font-bold text-slate-600 transition-colors"
                  >
                    +10만
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendOfferingAmount(10000)}
                    className="text-[10px] py-1 border border-rose-100 rounded-md bg-rose-50 hover:bg-rose-100 font-bold text-rose-600 transition-colors"
                  >
                    리셋
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">기도 제목 / 머리글 (선택)</label>
                <input
                  type="text"
                  value={offeringMessage}
                  onChange={(e) => setOfferingMessage(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-250 p-2.5 bg-white placeholder-slate-400"
                  placeholder="예: 범사에 감사드리며 청지기 직분 지켜주소서"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-99 text-xs font-extrabold text-white py-3 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>봉헌 전송하기</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

          {/* Submit/view self prayers request form */}
          <div className="bento-card-style p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-gray-950 text-sm border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
                <Heart className="h-4.5 w-4.5 text-pink-600 animate-pulse fill-pink-500" /> 목양 중보 기도제목 제출
              </h3>
              <p className="text-[10.5px] text-gray-400 leading-normal mt-1.5">
                작성 후 올리시면 교정 직속 교사 사제 및 합심 중보기도단에게 바로 전달되어 주간 집중 기도를 기탁하게 됩니다.
              </p>
            </div>

            <form onSubmit={handleAddPrayerSubmit} className="space-y-3.5">
              <textarea
                value={addPrayerText}
                onChange={(e) => setAddPrayerText(e.target.value)}
                rows={4}
                className="w-full text-xs rounded-lg border border-slate-250 p-2.5 bg-white focus:outline-blue-500"
                placeholder="예: 어머니 복부 무력증 검사 소견을 기다리고 있으니 평화 가득하도록 주께서 보호해주세요..."
                required
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-pink-600 hover:bg-pink-700 py-2.5 text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>나의 소망 기도 올리기</span>
              </button>
            </form>

            {/* list my submitted prayers */}
            {myPrayers.length > 0 && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <span className="text-[10.5px] font-bold text-gray-400 block uppercase">내 기도 간구 상태</span>
                <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {myPrayers.map((p, idx) => (
                    <div key={idx} className="rounded-xl bg-gray-50/50 p-2.5 border border-slate-100 text-[11px] leading-relaxed relative">
                      <p className="font-semibold text-gray-800 pr-12">{p.content}</p>
                      <div className="mt-1.5 flex justify-between items-center text-[9.5px]">
                        <span className="text-gray-400 font-mono">{p.createdAt}</span>
                        <span className={`font-bold ${p.completed ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {p.completed ? '응답됨!' : `기도 중 (동참 ${p.prayCount}회)`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </section>

      </div>

    </div>
  );
}
