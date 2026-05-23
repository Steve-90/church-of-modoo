/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  id: string;
  name: string;
  phone: string;
  birthDate: string; // YYYY-MM-DD
  duty: '목사' | '장로' | '권사' | '집사' | '성도' | '청년'; // 직분
  familyId: string; // 가족그룹ID
  baptism: '입교' | '세례' | '미세례'; // 세례여부
  status: '재적' | '이적' | '휴적'; // 상태
  district: string; // 구역 (예: "1구역", "2구역", "새가족반")
  registeredAt: string; // YYYY-MM-DD
  attendance: { [date: string]: boolean }; // 날짜별 출석 여부
}

export type OfferingType = '십일조' | '감사헌금' | '선교헌금' | '건축헌금' | '주일헌금' | '기타';

export interface Offering {
  id: string;
  date: string; // YYYY-MM-DD
  memberId: string; // 성도ID (또는 "무명")
  memberName: string; // 성도 이름 (또는 무명)
  type: OfferingType;
  amount: number;
  confirmed: boolean; // 입금확인여부
}

export interface Visitation {
  id: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  visitor: string; // 심방자 (예: 담임목사, 장로)
  content: string; // 심방내용
  prayerRequest: string; // 기도제목
}

export interface Prayer {
  id: string;
  memberId: string;
  memberName: string;
  content: string;
  createdAt: string; // YYYY-MM-DD
  completed: boolean; // 기도 완료여부
  prayCount: number; // 동참 횟수
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
}

export interface WorshipStep {
  name: string;
  person: string;
}

export interface Bulletin {
  date: string;
  title: string; // 설교 제목
  preacher: string; // 설교자
  scripture: string; // 말씀 본문
  sermonOutline: string[]; // 설교 요약/대지
  announcements: Announcement[];
  worshipOrder: WorshipStep[];
}

export interface ChurchConfig {
  name: string;
  denomination: string;
  logoType: 'emoji' | 'url';
  logoValue: string;
}

