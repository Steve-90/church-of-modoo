/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { getSupabase } from './supabaseClient';
import { Member, Offering, Visitation, Prayer, Bulletin, ChurchConfig } from '../types';

// THE PostgreSQL SCHEMA FOR SUPABASE FOR COPYING AND PASTING IN THEIR DASHBOARD SQL EDITOR
export const SUPABASE_SQL_SCHEMA = `-- 1. 교인 (Members) 테이블 생성
create table if not exists church_members (
  id text primary key,
  name text not null,
  phone text,
  birth_date text,
  duty text,
  family_id text,
  baptism text,
  status text,
  district text,
  registered_at text,
  attendance jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. 헌금 (Offerings) 테이블 생성
create table if not exists church_offerings (
  id text primary key,
  date text not null,
  member_id text,
  member_name text,
  type text not null,
  amount bigint not null,
  confirmed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. 중보기도 (Prayers) 테이블 생성
create table if not exists church_prayers (
  id text primary key,
  member_id text,
  member_name text,
  content text not null,
  created_at text not null,
  completed boolean default false,
  pray_count integer default 1,
  created_at_time timestamp with time zone default timezone('utc'::text, now())
);

-- 4. 심방기록 (Visitations) 테이블 생성
create table if not exists church_visitations (
  id text primary key,
  member_id text,
  member_name text,
  date text not null,
  visitor text not null,
  content text,
  prayer_request text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. 디지털 주보 (Bulletin) 테이블 생성
create table if not exists church_bulletin (
  id text primary key default 'active_bulletin',
  date text not null,
  preacher text,
  title text,
  scripture text,
  sermon_outline jsonb default '[]'::jsonb,
  worship_order jsonb default '[]'::jsonb,
  announcements jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. 교회 설정 (Church Config) 테이블 생성
create table if not exists church_config (
  id text primary key default 'active_config',
  name text not null default '은혜교회',
  denomination text default '대한예수교장로회',
  logo_type text default 'emoji',
  logo_value text default '✞',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS 비활성화 (테스트베드를 위해 간단한 익명 접근 권한 설정)
alter table church_members disable row level security;
alter table church_offerings disable row level security;
alter table church_prayers disable row level security;
alter table church_visitations disable row level security;
alter table church_bulletin disable row level security;
alter table church_config disable row level security;
`;

// 1. TEST CONNECTION ATTEMPT
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Supabase 주소 혹은 Anon Key를 먼저 설정해주십시오.' };
  }
  try {
    const { error } = await supabase.from('church_config').select('id').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('not found')) {
        return { 
          success: true, 
          message: '연결 성공! 단, 테이블이 생성되지 않았습니다. 하단 SQL 스크립트를 프로젝트 쿼리 편집기에 복사해서 실행하십시오.' 
        };
      }
      return { success: false, message: `통신 오류: ${error.message} (코드: ${error.code})` };
    }
    return { success: true, message: '클라우드 데이터베이스 연결 및 통신에 완벽하게 성공했습니다!' };
  } catch (err: any) {
    return { success: false, message: `연결 실패: ${err.message || err}` };
  }
}

// 2. PUSH ALL LOCAL DATA TO SUPABASE (Full Backup Setup)
export async function pushAllToSupabase(data: {
  members: Member[];
  offerings: Offering[];
  prayers: Prayer[];
  visitations: Visitation[];
  bulletin: Bulletin;
  config: ChurchConfig;
}): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, message: 'Supabase 연결이 미설정 상태입니다.' };

  try {
    // a. Push Members
    if (data.members.length > 0) {
      const dbMembers = data.members.map(m => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        birth_date: m.birthDate,
        duty: m.duty,
        family_id: m.familyId,
        baptism: m.baptism,
        status: m.status,
        district: m.district,
        registered_at: m.registeredAt,
        attendance: m.attendance
      }));
      const { error: err1 } = await supabase.from('church_members').upsert(dbMembers);
      if (err1) throw new Error(`교원 전산전송 실패: ${err1.message}`);
    }

    // b. Push Offerings
    if (data.offerings.length > 0) {
      const dbOfferings = data.offerings.map(o => ({
        id: o.id,
        date: o.date,
        member_id: o.memberId,
        member_name: o.memberName,
        type: o.type,
        amount: o.amount,
        confirmed: o.confirmed
      }));
      const { error: err2 } = await supabase.from('church_offerings').upsert(dbOfferings);
      if (err2) throw new Error(`예물전산전송 실패: ${err2.message}`);
    }

    // c. Push Prayers
    if (data.prayers.length > 0) {
      const dbPrayers = data.prayers.map(p => ({
        id: p.id,
        member_id: p.memberId,
        member_name: p.memberName,
        content: p.content,
        created_at: p.createdAt,
        completed: p.completed,
        pray_count: p.prayCount
      }));
      const { error: err3 } = await supabase.from('church_prayers').upsert(dbPrayers);
      if (err3) throw new Error(`기도간구전송 실패: ${err3.message}`);
    }

    // d. Push Visitations
    if (data.visitations.length > 0) {
      const dbVisitations = data.visitations.map(v => ({
        id: v.id,
        member_id: v.memberId,
        member_name: v.memberName,
        date: v.date,
        visitor: v.visitor,
        content: v.content,
        prayer_request: v.prayerRequest
      }));
      const { error: err4 } = await supabase.from('church_visitations').upsert(dbVisitations);
      if (err4) throw new Error(`심방부 전산전송 실패: ${err4.message}`);
    }

    // e. Push Bulletin
    const { error: err5 } = await supabase.from('church_bulletin').upsert({
      id: 'active_bulletin',
      date: data.bulletin.date,
      preacher: data.bulletin.preacher,
      title: data.bulletin.title,
      scripture: data.bulletin.scripture,
      sermon_outline: data.bulletin.sermonOutline,
      worship_order: data.bulletin.worshipOrder,
      announcements: data.bulletin.announcements
    });
    if (err5) throw new Error(`주보 전송 실패: ${err5.message}`);

    // f. Push Church Config
    const { error: err6 } = await supabase.from('church_config').upsert({
      id: 'active_config',
      name: data.config.name,
      denomination: data.config.denomination,
      logo_type: data.config.logoType,
      logo_value: data.config.logoValue
    });
    if (err6) throw new Error(`기초설정 전송 실패: ${err6.message}`);

    return { success: true, message: '로컬 임시 영수 데이터 전체를 클라우드 Supabase DB로 내보냈습니다!' };

  } catch (err: any) {
    return { success: false, message: `내보내기 실패: ${err.message || err}` };
  }
}

// 3. PULL ALL DATA FROM SUPABASE (Full Backup Restore)
export async function pullFromSupabase(): Promise<{
  success: boolean;
  message: string;
  data?: {
    members: Member[];
    offerings: Offering[];
    prayers: Prayer[];
    visitations: Visitation[];
    bulletin: Bulletin;
    config: ChurchConfig;
  };
}> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, message: 'Supabase 연결이 미설정 상태입니다.' };

  try {
    // a. Fetch Members
    const { data: mData, error: mErr } = await supabase.from('church_members').select('*');
    if (mErr) throw new Error(`교원 인입 실패: ${mErr.message}`);

    // b. Fetch Offerings
    const { data: oData, error: oErr } = await supabase.from('church_offerings').select('*');
    if (oErr) throw new Error(`예물 대조 실패: ${oErr.message}`);

    // c. Fetch Prayers
    const { data: pData, error: pErr } = await supabase.from('church_prayers').select('*');
    if (pErr) throw new Error(`중보 대조 실패: ${pErr.message}`);

    // d. Fetch Visitations
    const { data: vData, error: vErr } = await supabase.from('church_visitations').select('*');
    if (vErr) throw new Error(`심방 대조 실패: ${vErr.message}`);

    // e. Fetch Bulletin
    const { data: bData, error: bErr } = await supabase.from('church_bulletin').select('*').eq('id', 'active_bulletin').maybeSingle();
    if (bErr) throw new Error(`디지털주보 인입 실패: ${bErr.message}`);

    // f. Fetch Config
    const { data: cData, error: cErr } = await supabase.from('church_config').select('*').eq('id', 'active_config').maybeSingle();
    if (cErr) throw new Error(`기본 정보 대조 실패: ${cErr.message}`);

    // Mapping back to TS Types
    const members: Member[] = (mData || []).map(m => ({
      id: m.id,
      name: m.name,
      phone: m.phone || '',
      birthDate: m.birth_date || '',
      duty: (m.duty as '목사' | '장로' | '권사' | '집사' | '성도' | '청년') || '성도',
      familyId: m.family_id || '',
      baptism: (m.baptism as '입교' | '세례' | '미세례') || '미세례',
      status: (m.status as '재적' | '이적' | '휴적') || '재적',
      district: m.district || '1구역',
      registeredAt: m.registered_at || '',
      attendance: m.attendance || {}
    }));

    const offerings: Offering[] = (oData || []).map(o => ({
      id: o.id,
      date: o.date,
      memberId: o.member_id || '',
      memberName: o.member_name || '무명',
      type: o.type,
      amount: Number(o.amount),
      confirmed: o.confirmed || false
    }));

    const prayers: Prayer[] = (pData || []).map(p => ({
      id: p.id,
      memberId: p.member_id || '',
      memberName: p.member_name || '무명',
      content: p.content,
      createdAt: p.created_at || '',
      completed: p.completed || false,
      prayCount: p.pray_count || 1
    }));

    const visitations: Visitation[] = (vData || []).map(v => ({
      id: v.id,
      memberId: v.member_id || '',
      memberName: v.member_name || '무명',
      date: v.date,
      visitor: v.visitor,
      content: v.content || '',
      prayerRequest: v.prayer_request || ''
    }));

    // Setup active default values if DB items are empty
    const bulletin: Bulletin = bData ? {
      date: bData.date,
      preacher: bData.preacher || '',
      title: bData.title || '',
      scripture: bData.scripture || '',
      sermonOutline: bData.sermon_outline || [],
      worshipOrder: bData.worship_order || [],
      announcements: bData.announcements || []
    } : {
      date: '2026-05-24',
      preacher: '설교자 미상',
      title: '영의 생각 육의 생각',
      scripture: '로마서 8:6',
      sermonOutline: [],
      worshipOrder: [],
      announcements: []
    };

    const config: ChurchConfig = cData ? {
      name: cData.name,
      denomination: cData.denomination || '',
      logoType: (cData.logo_type as 'emoji' | 'url') || 'emoji',
      logoValue: cData.logo_value || '✞'
    } : {
      name: '은혜교회',
      denomination: '대한예수교장로회',
      logoType: 'emoji',
      logoValue: '✞'
    };

    return {
      success: true,
      message: '클라우드 Supabase DB로부터 실시간 전산 데이터를 완벽하게 동기화해 가져왔습니다!',
      data: { members, offerings, prayers, visitations, bulletin, config }
    };

  } catch (err: any) {
    return { success: false, message: `데이터 대조실패: ${err.message || err}` };
  }
}

// 4. REAL-TIME SINGULAR SYNC EVENT TRIGGERS
export async function syncSingleMember(m: Member) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('church_members').upsert({
    id: m.id,
    name: m.name,
    phone: m.phone,
    birth_date: m.birthDate,
    duty: m.duty,
    family_id: m.familyId,
    baptism: m.baptism,
    status: m.status,
    district: m.district,
    registered_at: m.registeredAt,
    attendance: m.attendance
  });
}

export async function syncSingleOffering(o: Offering) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('church_offerings').upsert({
    id: o.id,
    date: o.date,
    member_id: o.memberId,
    member_name: o.memberName,
    type: o.type,
    amount: o.amount,
    confirmed: o.confirmed
  });
}

export async function syncSinglePrayer(p: Prayer) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('church_prayers').upsert({
    id: p.id,
    member_id: p.memberId,
    member_name: p.memberName,
    content: p.content,
    created_at: p.createdAt,
    completed: p.completed,
    pray_count: p.prayCount
  });
}

export async function syncSingleVisitation(v: Visitation) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('church_visitations').upsert({
    id: v.id,
    member_id: v.memberId,
    member_name: v.memberName,
    date: v.date,
    visitor: v.visitor,
    content: v.content,
    prayer_request: v.prayerRequest
  });
}

export async function syncBulletin(b: Bulletin) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('church_bulletin').upsert({
    id: 'active_bulletin',
    date: b.date,
    preacher: b.preacher,
    title: b.title,
    scripture: b.scripture,
    sermon_outline: b.sermonOutline,
    worship_order: b.worshipOrder,
    announcements: b.announcements
  });
}

export async function syncChurchConfig(c: ChurchConfig) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('church_config').upsert({
    id: 'active_config',
    name: c.name,
    denomination: c.denomination,
    logo_type: c.logoType,
    logo_value: c.logoValue
  });
}
