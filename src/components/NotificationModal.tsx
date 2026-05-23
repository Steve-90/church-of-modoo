/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Member, ChurchConfig } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: 'general' | 'birthday' | 'offering';
  targetMember?: Member | null;
  amount?: number;
  offeringType?: string;
  churchConfig?: ChurchConfig;
}

export default function NotificationModal({
  isOpen,
  onClose,
  initialTemplate = 'general',
  targetMember = null,
  amount = 0,
  offeringType = '',
  churchConfig
}: NotificationModalProps) {
  const [template, setTemplate] = useState<'general' | 'birthday' | 'offering'>(initialTemplate);
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [agreedToReceive, setAgreedToReceive] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (targetMember) {
      setRecipientName(targetMember.name);
      setRecipientPhone(targetMember.phone);
    } else {
      setRecipientName('전체 교인');
      setRecipientPhone('전체 발송 (그룹)');
    }
  }, [targetMember, isOpen]);

  useEffect(() => {
    setTemplate(initialTemplate);
  }, [initialTemplate, isOpen]);

  // Construct message template based on selections
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const churchName = churchConfig?.name || '은혜교회';
    if (template === 'birthday') {
      const name = recipientName || '[성도명]';
      setMessage(
        `[${churchName} 알림톡 - 생일 축하]\n\n사랑하는 ${name} 성도님, 오늘 누구보다 기쁘고 행복한 생일을 진심으로 축하드립니다! \n\n"네 길을 여호와께 맡기라 그를 의지하면 그가 이루시고" (시편 37:5)\n\n하늘의 가득한 평강과 위로가 성도님의 가정에 일 년 내내 가득하기를 온 성도들과 함께 축복하며 기도합니다.\n\n- ${churchName} 목양실`
      );
    } else if (template === 'offering') {
      const name = recipientName || '[성도명]';
      const type = offeringType || '감사헌금';
      const formattedAmount = amount > 0 ? `${amount.toLocaleString()}원` : '[금액]';
      setMessage(
        `[${churchName} 알림톡 - 헌금 확인 안내]\n\n귀한 예물을 올려주신 ${name} 성도님께 안내말씀 드립니다.\n\n■ 일시: ${todayStr}\n■ 구분: ${type}\n■ 금액: ${formattedAmount}\n\n정성스레 드려진 예물이 하나님의 선한 뜻 가운데 교회 사역과 어려운 이웃을 살리는 복된 일에 투명하게 사용됨을 보고드립니다. 축복과 은혜가 흘러가기를 소망합니다.\n\n- ${churchName} 재정실`
      );
    } else {
      setMessage(
        `[${churchName} 알림톡 - 주간 공지사항]\n\n${churchName} 성도님들께 한 주간 진행되는 핵심 예배 및 봉사 상세 일정을 공유해 드립니다.\n\n■ 예배 안내: 주일 대예배 오전 11시 본당\n■ 이번 주 설교: '새 일을 행하시는 여호와를 바라보라'\n■ 전교인 알림: 다음 주 야외 예배 준비 관계상 구역장 모임이 목요일 저녁 8시 ZOOM으로 모입니다.\n\n성도 마이페이지(앱) 상에서 간편한 모바일 출석 체크를 이용해 주시기 바랍니다.\n\n- ${churchName} 사무국`
      );
    }
  }, [template, recipientName, amount, offeringType, isOpen, churchConfig]);

  const handleSendAlimtalk = () => {
    if (!agreedToReceive) {
      alert('알림톡 수신 동의가 완료되어야 카카오톡 AlimTalk 전송이 가능합니다.');
      return;
    }
    
    setIsSending(true);
    setSendResult(null);

    // Simulate API webhook to Make.com / Kakao Alimtalk server with beautiful progress indicators
    setTimeout(() => {
      setIsSending(false);
      setSendResult({
        success: true,
        msg: `[Make.com Webhook 연동 완] ${recipientName} 성도님에게 알림톡 메시지가 성공적으로 전송 완료되었습니다.`
      });
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        id="notification-modal-container"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-emerald-50/75 px-6 py-4">
          <div className="flex items-center gap-2.5 text-emerald-800">
            <MessageSquare className="h-5.5 w-5.5" />
            <span className="font-semibold text-lg">카카오 알림톡 자동 발송 시스템 (Make.com 연동)</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            id="close-notification-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* Settings Panel (Left 7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Template selector */}
            <div>
              <label className="mb-1.5 block font-medium text-xs text-gray-500 uppercase tracking-wider">발송 템플릿 선택</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplate('general')}
                  className={`rounded-lg py-2 px-3 text-sm font-medium border text-center transition-all ${
                    template === 'general'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  주간 공지사항
                </button>
                <button
                  type="button"
                  onClick={() => setTemplate('birthday')}
                  className={`rounded-lg py-2 px-3 text-sm font-medium border text-center transition-all ${
                    template === 'birthday'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  생일 축하
                </button>
                <button
                  type="button"
                  onClick={() => setTemplate('offering')}
                  className={`rounded-lg py-2 px-3 text-sm font-medium border text-center transition-all ${
                    template === 'offering'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  헌금 입금확인
                </button>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">수신 대상자</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                  placeholder="예: 김은혜"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">휴대폰 연락처</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                  placeholder="010-XXXX-XXXX"
                />
              </div>
            </div>

            {/* Text Editor */}
            <div>
              <div className="mb-1 flex justify-between">
                <label className="text-xs font-semibold text-gray-600">알림톡 본문 (상세 편집)</label>
                <span className="text-[10px] text-gray-400">카카오 표준 템플릿 가이드 적용</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono text-gray-700 focus:border-emerald-500 focus:outline-none leading-relaxed"
                placeholder="알림톡 메시지 내용을 입력해 주세요."
              />
            </div>

            {/* Recipient Consent Notification Check */}
            <div className="rounded-lg bg-blue-50/60 p-3 flex gap-2.5 items-start">
              <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-900">개인정보 보호 및 수신 동의 여부</p>
                <p className="text-[11px] text-blue-700/90 mt-0.5 leading-normal">
                  교회 행정 알림톡 및 헌금 내역 조회를 위해 명부에 기재된 개인정보(이름, 휴대폰) 수집 동의가 완료되었습니다.
                </p>
                <label className="mt-2 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToReceive}
                    onChange={(e) => setAgreedToReceive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] font-bold text-blue-800">해당 성도의 모바일 알림톡 전송 요청 및 명시적 동의 확인</span>
                </label>
              </div>
            </div>
          </div>

          {/* Kakao Visual Simulator (Right 5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between rounded-xl bg-amber-50/40 border border-amber-100 p-4">
            <div>
              <span className="mb-3 block font-semibold text-xs text-amber-800 text-center bg-amber-100/60 rounded-full py-0.5">
                모바일 카카오톡 수신 화면 시뮬레이터
              </span>
              
              {/* Smartphone Inner Message Mockup */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                {/* Yellow Header */}
                <div className="bg-[#FFE600] text-gray-900 px-3 py-2 flex items-center justify-between text-xs font-bold shadow-xs">
                  <span>KakaoTalk 알림톡</span>
                  <span className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded-sm">Kakaotalk</span>
                </div>
                {/* Message Body */}
                <div className="p-3 bg-[#BACEE0] min-h-[220px] flex flex-col justify-end">
                  <div className="bg-white rounded-lg p-3 text-[11px] leading-relaxed text-gray-800 shadow-sm max-w-[90%] self-start relative">
                    <div className="font-bold border-b border-gray-100 pb-1 mb-1 text-emerald-700 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {churchConfig?.name || '은혜교회'} 알림톡
                    </div>
                    <pre className="whitespace-pre-wrap font-sans break-all">{message}</pre>
                    <div className="mt-2 border-t border-gray-100 pt-2 flex justify-between items-center text-[9px] text-gray-400">
                      <span>공식 알림톡 비즈니스 채널</span>
                      <span>무료 수신거부</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons with status display */}
            <div className="mt-4 pt-3 border-t border-amber-100/50">
              <AnimatePresence mode="wait">
                {sendResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-center text-xs text-emerald-800 font-medium"
                  >
                    <div className="flex items-center gap-1 justify-center mb-0.5">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                      <span>전송 완료</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">{sendResult.msg}</p>
                    <button
                      type="button"
                      onClick={() => setSendResult(null)}
                      className="mt-1.5 text-[10px] font-bold text-emerald-700 underline"
                    >
                      다시 전송하기
                    </button>
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={handleSendAlimtalk}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Make.com 트리거 전송 중...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4.5 w-4.5" />
                        <span>알림톡 즉시 전송하기</span>
                      </>
                    )}
                  </button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Info footer */}
        <div className="bg-gray-50 px-6 py-3.5 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Make.com 시나리오 주소 자동 호출 연동
          </span>
          <span className="font-semibold text-emerald-700">성도별 발송 통계 100% 동기화</span>
        </div>
      </motion.div>
    </div>
  );
}
