/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Offering, Visitation, Prayer, Bulletin } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'M001',
    name: '김은혜',
    phone: '010-1234-5678',
    birthDate: '1984-05-24', // Tomorrow is her birthday! (May 24)
    duty: '권사',
    familyId: 'F101',
    baptism: '세례',
    status: '재적',
    district: '1구역',
    registeredAt: '2020-03-15',
    attendance: {
      '2026-05-10': true,
      '2026-05-17': true,
    }
  },
  {
    id: 'M002',
    name: '이수민',
    phone: '010-8765-4321',
    birthDate: '1992-05-26', // Birthday on May 26 (this week)
    duty: '집사',
    familyId: 'F102',
    baptism: '세례',
    status: '재적',
    district: '2구역',
    registeredAt: '2021-11-05',
    attendance: {
      '2026-05-10': true,
      '2026-05-17': false, // Absent last week (May 17)
    }
  },
  {
    id: 'M003',
    name: '박태양',
    phone: '010-3333-5555',
    birthDate: '2001-08-12',
    duty: '청년',
    familyId: 'F103',
    baptism: '입교',
    status: '재적',
    district: '청년부',
    registeredAt: '2023-05-20',
    attendance: {
      '2026-05-10': false,
      '2026-05-17': false, // Absent for 2 weeks consecutive
    }
  },
  {
    id: 'M004',
    name: '최영호',
    phone: '010-4444-6666',
    birthDate: '1970-12-05',
    duty: '장로',
    familyId: 'F104',
    baptism: '세례',
    status: '재적',
    district: '1구역',
    registeredAt: '2015-01-10',
    attendance: {
      '2026-05-10': true,
      '2026-05-17': true,
    }
  },
  {
    id: 'M005',
    name: '정사랑',
    phone: '010-7777-8888',
    birthDate: '1965-05-21', // Just had birthday (May 21)
    duty: '권사',
    familyId: 'F105',
    baptism: '세례',
    status: '재적',
    district: '2구역',
    registeredAt: '2018-04-22',
    attendance: {
      '2026-05-10': true,
      '2026-05-17': true,
    }
  },
  {
    id: 'M006',
    name: '한하늘',
    phone: '010-2222-9999',
    birthDate: '2010-10-10',
    duty: '성도',
    familyId: 'F101', // Family member with Kim EunHye
    baptism: '미세례',
    status: '재적',
    district: '1구역',
    registeredAt: '2024-02-01',
    attendance: {
      '2026-05-10': true,
      '2026-05-17': true,
    }
  },
  {
    id: 'M007',
    name: '오지수',
    phone: '010-5555-1111',
    birthDate: '1995-12-25',
    duty: '성도',
    familyId: 'F106',
    baptism: '미세례',
    status: '휴적', // Inactive
    district: '새가족반',
    registeredAt: '2026-04-26', // Newly registered
    attendance: {
      '2026-05-10': true,
      '2026-05-17': false,
    }
  }
];

export const INITIAL_OFFERINGS: Offering[] = [
  {
    id: 'O001',
    date: '2026-05-17',
    memberId: 'M004',
    memberName: '최영호',
    type: '십일조',
    amount: 500000,
    confirmed: true
  },
  {
    id: 'O002',
    date: '2026-05-17',
    memberId: 'M001',
    memberName: '김은혜',
    type: '감사헌금',
    amount: 100000,
    confirmed: true
  },
  {
    id: 'O003',
    date: '2026-05-17',
    memberId: 'M006',
    memberName: '한하늘',
    type: '주일헌금',
    amount: 10000,
    confirmed: true
  },
  {
    id: 'O004',
    date: '2026-05-22', // A direct deposit bank transaction waiting for review (May 22)
    memberId: 'M002',
    memberName: '이수민',
    type: '십일조',
    amount: 300000,
    confirmed: false // Needs confirmation in checklist!
  },
  {
    id: 'O005',
    date: '2026-05-23', // Direct deposit awaiting verification today
    memberId: 'O_ANONYMOUS',
    memberName: '무명(직접입금)',
    type: '감사헌금',
    amount: 50000,
    confirmed: false // Needs confirmation!
  },
  {
    id: 'O006',
    date: '2026-05-10',
    memberId: 'M005',
    memberName: '정사랑',
    type: '선교헌금',
    amount: 200000,
    confirmed: true
  }
];

export const INITIAL_VISITATIONS: Visitation[] = [
  {
    id: 'V001',
    memberId: 'M001',
    memberName: '김은혜',
    date: '2025-11-20',
    visitor: '이바울 목사님',
    content: '가정 이사 후 첫 대면 심방 예배를 드렸습니다. 온 가족이 주님 안에서 믿음의 뿌리를 깊이 내리고 평안하길 소망합니다.',
    prayerRequest: '자녀 한하늘 성도의 학업 진로 인도와 집안 건강을 위해 기도요청'
  },
  {
    id: 'V002',
    memberId: 'M002',
    memberName: '이수민',
    date: '2026-04-15',
    visitor: '박디모데 장로님',
    content: '요즘 직장 이직 문제로 진로 장벽을 마주한 이수민 집사와 면담 및 성경 통독 나눔을 진행했습니다.',
    prayerRequest: '이직할 직장이 성경적 기준에 잘 맞고 하나님의 지혜로 선택할 수 있도록 기도요청'
  }
];

export const INITIAL_PRAYERS: Prayer[] = [
  {
    id: 'P001',
    memberId: 'M002',
    memberName: '이수민',
    content: '새로 입사한 직장에서 그리스도인의 향기를 드러내며 성실하게 잘 적응하게 하시고, 좋은 영적 동료들을 곁에 주시옵소서.',
    createdAt: '2026-05-18',
    completed: false,
    prayCount: 14
  },
  {
    id: 'P002',
    memberId: 'M001',
    memberName: '김은혜',
    content: '연로하신 양가 부모님들의 관절 및 신경계 통증이 깨끗이 나음 받게 하시고 영육이 강건하도록 주님 붙잡아 주소서.',
    createdAt: '2026-05-19',
    completed: false,
    prayCount: 8
  },
  {
    id: 'P003',
    memberId: 'M003',
    memberName: '박태양',
    content: '이번 청년부 연말 단기 선교를 기도로 잘 준비하게 하시고, 물질과 마음 모두 부족함 없이 하나님 은혜를 체험하게 하소서.',
    createdAt: '2026-05-20',
    completed: false,
    prayCount: 22
  },
  {
    id: 'P004',
    memberId: 'M006',
    memberName: '한하늘',
    content: '기말고사 시험 기간에 당황하지 않고 지혜를 더해주시며, 매일 아침 말씀을 깊이 묵상하고 감사하는 하루를 살 수 있게 하소서.',
    createdAt: '2026-05-22',
    completed: false,
    prayCount: 5
  }
];

export const INITIAL_BULLETIN: Bulletin = {
  date: '2026-05-24',
  title: '새 일을 행하시는 여호와를 바라보라',
  preacher: '이바울 담임목사',
  scripture: '이사야 43장 18절 ~ 21절',
  sermonOutline: [
    '1. 이전 일을 기억하지 말며 옛날 일을 생각하지 말라 (인간적인 미련과 상처의 극복)',
    '2. 광야에 길을, 사막에 강을 내시는 주님의 역사를 목도하라 (불가능을 가능케 하시는 하나님의 주권)',
    '3. 이 백성은 내가 나를 위하여 지었으니 나를 찬송하게 하려 함이니라 (삶의 본질과 창조 목적의 회복)'
  ],
  announcements: [
    {
      id: 'A001',
      title: '새가족 등록 및 환영',
      content: '교회에 처음 오신 성도님들을 주님의 이름으로 진심으로 환영합니다. 예배 후 새가족실에서 만남과 교제가 있습니다.'
    },
    {
      id: 'A002',
      title: '청년부 기독 리더십 연수 교육',
      content: '이번 주 토요일 오후 2시 소예배실에서 기독 리더 양성을 위한 특별 연수 일정이 있습니다. 모든 리더 및 헬퍼는 필참 바랍니다.'
    },
    {
      id: 'A003',
      title: '상반기 전교인 야외 열린 예배 공지',
      content: '다음 주일(5/31)은 하늘푸른 숲속 공원에서 야외 열린 예배 및 전교인 연합 친목 체육 프로그램으로 진행됩니다.'
    }
  ],
  worshipOrder: [
    { name: '예배 선언', person: '사회자' },
    { name: '신앙 고백', person: '사도신경 (다같이)' },
    { name: '찬송가 가창', person: '28장 - 복의 근원 강림하사' },
    { name: '대표 기도', person: '최영호 장로' },
    { name: '성경 봉독', person: '이사야 43:18~21 (사회자)' },
    { name: '찬양대 찬양', person: '호산나 찬양대' },
    { name: '말씀 선포', person: '이바울 목사' },
    { name: '봉헌 및 감사기도', person: '다같이 / 이바울 목사' },
    { name: '소식 나눔', person: '사무국' },
    { name: '축도', person: '이바울 목사' }
  ]
};
