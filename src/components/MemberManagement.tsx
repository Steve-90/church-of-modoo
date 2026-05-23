/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Member } from '../types';
import { 
  Search, Filter, UserPlus, Database, Phone, Check, ChevronRight, X, 
  Upload, AlertCircle, FileSpreadsheet, Sparkles, CheckSquare, RefreshCw
} from 'lucide-react';

interface MemberManagementProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onOpenAlimtalk: (template: 'general' | 'birthday' | 'offering', member: Member | null) => void;
}

export default function MemberManagement({
  members,
  onAddMember,
  onUpdateMember,
  onOpenAlimtalk
}: MemberManagementProps) {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuty, setSelectedDuty] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedBaptism, setSelectedBaptism] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Interactive Excel Migration Panel States
  const [showMigrator, setShowMigrator] = useState(false);
  const [rawExcelText, setRawExcelText] = useState('');
  const [migrationPreview, setMigrationPreview] = useState<Member[]>([]);
  const [migrationError, setMigrationError] = useState('');

  // Add Member Dialog States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState<Partial<Member>>({
    name: '',
    phone: '',
    birthDate: '1990-01-01',
    duty: '성도',
    familyId: '',
    baptism: '미세례',
    status: '재적',
    district: '1구역'
  });

  // Selected Member for Profile Detail Modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Active Districts & Duties in church
  const duties = ['목사', '장로', '권사', '집사', '성도', '청년'];
  const districts = ['1구역', '2구역', '새가족반', '청년부'];
  const baptisms = ['입교', '세례', '미세례'];
  const statuses = ['재적', '이적', '휴적'];

  // 1. Core Search/Filtering algorithm
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.replace(/-/g, '').includes(searchTerm.replace(/-/g, ''));
    
    const matchesDuty = selectedDuty === 'ALL' || m.duty === selectedDuty;
    const matchesDistrict = selectedDistrict === 'ALL' || m.district === selectedDistrict;
    const matchesBaptism = selectedBaptism === 'ALL' || m.baptism === selectedBaptism;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;

    return matchesSearch && matchesDuty && matchesDistrict && matchesBaptism && matchesStatus;
  });

  // 2. Parser for Excel Migration
  // Expected Excel Format (columns Tab-separated or Comma-separated):
  // 이룸, 연락처, 생년월일, 직분, 세례여부, 상태, 구역
  const handleParseExcel = () => {
    setMigrationError('');
    if (!rawExcelText.trim()) {
      setMigrationError('입력된 엑셀 텍스트가 없습니다. 예시 양식에 따라 데이터를 붙여넣기 해보세요.');
      return;
    }

    try {
      const rows = rawExcelText.trim().split('\n');
      const parsed: Member[] = [];

      rows.forEach((row, idx) => {
        // Splitting by tabs (copied from Excel/Sheets) or commas
        const cols = row.includes('\t') ? row.split('\t') : row.split(',');
        if (cols.length < 2) return; // Skip empty/invalid rows

        const name = cols[0]?.trim() || '';
        const phone = cols[1]?.trim() || '010-0000-0000';
        const birthDate = cols[2]?.trim() || '1990-01-01';
        
        // Duty Mapping with validation
        let duty = (cols[3]?.trim() as any) || '성도';
        if (!['목사', '장로', '권사', '집사', '성도', '청년'].includes(duty)) duty = '성도';

        // Baptism Mapping
        let baptism = (cols[4]?.trim() as any) || '미세례';
        if (!['입교', '세례', '미세례'].includes(baptism)) baptism = '미세례';

        // Status Mapping
        let status = (cols[5]?.trim() as any) || '재적';
        if (!['재적', '이적', '휴적'].includes(status)) status = '재적';

        const district = cols[6]?.trim() || '1구역';

        if (name) {
          parsed.push({
            id: `M_MIG_${idx}_${Date.now()}`,
            name,
            phone,
            birthDate,
            duty,
            familyId: `F_MIG_${idx}`,
            baptism,
            status,
            district,
            registeredAt: new Date().toISOString().split('T')[0],
            attendance: {}
          });
        }
      });

      if (parsed.length === 0) {
        setMigrationError('명확하게 분석된 행이 없습니다. 콤마(,)나 탭으로 구분된 컬럼 형태인지 검토하세요.');
      } else {
        setMigrationPreview(parsed);
      }
    } catch (e) {
      setMigrationError('파싱 중 예기치 않은 문법 오류가 생겼습니다.');
    }
  };

  const handleApplyMigration = () => {
    if (migrationPreview.length === 0) return;
    migrationPreview.forEach(m => onAddMember(m));
    alert(`${migrationPreview.length}명의 교인 데이터가 구글 스프레드시트 템플릿과 성공적으로 동기화 처리되었습니다!`);
    setRawExcelText('');
    setMigrationPreview([]);
    setShowMigrator(false);
  };

  const handleAddMemberSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) {
      alert('이름과 휴대폰 번호는 필수 입력 사항입니다.');
      return;
    }

    const memberToCreate: Member = {
      id: `M_${Date.now()}`,
      name: newMember.name,
      phone: newMember.phone,
      birthDate: newMember.birthDate || '1990-01-01',
      duty: (newMember.duty as any) || '성도',
      familyId: newMember.familyId || `F_${Date.now()}`,
      baptism: (newMember.baptism as any) || '미세례',
      status: (newMember.status as any) || '재적',
      district: newMember.district || '1구역',
      registeredAt: new Date().toISOString().split('T')[0],
      attendance: {}
    };

    onAddMember(memberToCreate);
    setShowAddModal(false);
    setSelectedMember(memberToCreate); // Open detail modal right away
    setNewMember({
      name: '',
      phone: '',
      birthDate: '1990-01-01',
      duty: '성도',
      familyId: '',
      baptism: '미세례',
      status: '재적',
      district: '1구역'
    });
  };

  const handleUpdateMemberSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      onUpdateMember(selectedMember);
      setIsEditingProfile(false);
      alert('성도님의 교적 프로필 및 세례/구역 권한 설정이 안전하게 업데이트 되었습니다.');
    }
  };

  return (
    <div className="space-y-6" id="member-management-tab">
      
      {/* 1. TOP UTILITY ACTION BAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            교인 명부 대장 및 관리 <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">{filteredMembers.length}명 관리 중</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            간편 교인 검색, 조건별 멀티 필터링 및 엑셀 마이그레이션을 지원합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowMigrator(!showMigrator)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 cursor-pointer shadow-xs transition-colors"
          >
            <Database className="h-4 w-4 text-emerald-600" />
            <span>엑셀 마이그레이션</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer transition-colors"
            id="register-member-btn"
          >
            <UserPlus className="h-4 w-4" />
            <span>신규 교인 등록</span>
          </button>
        </div>
      </div>

      {/* 2. EXCEL MIGRATOR PANEL (Softr Feature Implementation) */}
      {showMigrator && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 space-y-4" id="excel-migrator-panel">
          <div className="flex items-start justify-between">
            <div className="flex gap-2.5 items-start">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800 shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">구글 스프레드시트 엑셀 대량 붙여넣기 (즉시 행정 동기화)</h3>
                <p className="text-xs text-gray-500 mt-1leading-relaxed">
                  스프레드시트에 기재해 뒀던 행 데이터를 아래에 복사+붙여넣기 하세요.<br />
                  구분 칼럼 순서: <span className="font-semibold text-emerald-800">[이름], [연락처], [생년월일(YYYY-MM-DD)], [직분], [세례여부], [상태], [구역]</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowMigrator(false)}
              className="p-1 rounded text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">여기에 엑셀 데이터 열 복사 (탭 또는 쉼표 구분)</label>
              <textarea
                value={rawExcelText}
                onChange={(e) => setRawExcelText(e.target.value)}
                rows={5}
                className="w-full text-xs font-mono rounded-lg border border-gray-200 bg-white p-3 focus:outline-emerald-500"
                placeholder="예시)&#10;정재우,010-9988-7766,1988-11-23,집사,세례,재적,1구역&#10;임수경,010-4455-2233,1975-06-15,권사,세례,재적,2구역"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400">데이터를 한 줄에 한 명씩 작성하세요.</span>
                <button
                  type="button"
                  onClick={handleParseExcel}
                  className="rounded bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold text-white px-3 py-1.5 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> 매칭 프리뷰 분석
                </button>
              </div>
              {migrationError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {migrationError}
                </p>
              )}
            </div>

            {/* Preview Box */}
            <div className="rounded-xl border border-gray-150 bg-white p-4 flex flex-col justify-between max-h-[220px]">
              <div>
                <span className="font-bold text-xs text-gray-700 block mb-2">마이그레이션 교인 추가 예상 리스트 ({migrationPreview.length}명)</span>
                <div className="overflow-y-auto max-h-[140px] space-y-1 divide-y divide-gray-50">
                  {migrationPreview.length > 0 ? (
                    migrationPreview.map((p, idx) => (
                      <div key={idx} className="text-[11px] py-1.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-900">{p.name}</span>
                          <span className="text-gray-400 ml-1">({p.duty} • {p.district})</span>
                        </div>
                        <span className="text-gray-500 font-mono">{p.phone}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6 leading-relaxed">
                      이전할 스프레드시트 텍스트 분석 결과가 여기에 노출됩니다.
                    </p>
                  )}
                </div>
              </div>

              {migrationPreview.length > 0 && (
                <button
                  type="button"
                  onClick={handleApplyMigration}
                  className="w-full rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white py-2 text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>스프레드시트 템플릿 즉시 병합 및 저장 완료하기</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. MULTI FILTERING CONTROLS */}
      <section className="rounded-2xl border border-gray-150 bg-white p-4 flex flex-col gap-4 shadow-xs" id="filters-section">
        {/* Row 1: Search & Basic select */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
              placeholder="성도 이름 또는 전화번호 뒷자리 검색..."
            />
          </div>

          {/* Filters grouped */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Duty Select */}
            <div className="flex flex-col gap-1">
              <select
                value={selectedDuty}
                onChange={(e) => setSelectedDuty(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">전체 직분 필터</option>
                {duties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* District Select */}
            <div className="flex flex-col gap-1">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">전체 교구/구역</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Baptism Select */}
            <div className="flex flex-col gap-1">
              <select
                value={selectedBaptism}
                onChange={(e) => setSelectedBaptism(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">전체 세례 구분</option>
                {baptisms.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Status Select */}
            <div className="flex flex-col gap-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">전체 교적 상태</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ADAPTIVE LISTING (TABLE VS CARD COEXISTENCE BASED ON DEVICE WIDTH) */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        
        {/* Desktop Table: Grid representation (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse" id="desktop-members-table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">성도ID</th>
                <th className="px-6 py-4">이름 (성함)</th>
                <th className="px-6 py-4">직분 (임무)</th>
                <th className="px-6 py-4">구역 구분</th>
                <th className="px-6 py-4">연락처</th>
                <th className="px-6 py-4">생년월일</th>
                <th className="px-6 py-4">세례 과정</th>
                <th className="px-6 py-4">등록 상태</th>
                <th className="px-6 py-4 text-right">상세조회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredMembers.length > 0 ? (
                filteredMembers.map(m => (
                  <tr 
                    key={m.id} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => { setSelectedMember(m); setIsEditingProfile(false); }}
                  >
                    <td className="px-6 py-4 font-mono text-gray-400 font-semibold">{m.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-emerald-700">{m.name}</td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5">
                        {m.duty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{m.district}</td>
                    <td className="px-6 py-4 text-gray-650 font-mono">{m.phone}</td>
                    <td className="px-6 py-4 text-gray-500">{m.birthDate || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        m.baptism === '세례' ? 'bg-sky-50 text-sky-850 border border-sky-100' :
                        m.baptism === '입교' ? 'bg-indigo-50 text-indigo-850' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {m.baptism}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${
                        m.status === '재적' ? 'text-emerald-600' :
                        m.status === '휴적' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        ● {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg hover:bg-gray-100 p-1.5 inline-flex items-center text-gray-400 group-hover:text-emerald-700 transition-transform">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-450">
                    일치하는 교회 성도 명부가 보이지 않습니다. 다른 조건으로 필터를 적용하거나 이름을 재검토해 주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: High Density Card Feed (Hidden on desktop) */}
        <div className="block md:hidden divide-y divide-gray-100" id="mobile-members-listing">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(m => (
              <div 
                key={m.id} 
                className="p-4 bg-white active:bg-gray-50 flex items-center justify-between gap-4 cursor-pointer"
                onClick={() => { setSelectedMember(m); setIsEditingProfile(false); }}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{m.name}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1 rounded">{m.duty}</span>
                    <span className={`text-[9px] font-bold ${m.status === '재적' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      ● {m.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-500">
                    <span className="font-mono">{m.phone}</span>
                    <span className="text-gray-350">•</span>
                    <span>{m.district}</span>
                    <span className="text-gray-350">•</span>
                    <span>세례 : {m.baptism}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <a 
                    href={`tel:${m.phone}`} 
                    onClick={(e) => e.stopPropagation()} 
                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 px-4 text-gray-400 text-xs">
              검색된 교인이 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* 5. ADD MEMBER MODAL DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl" id="add-member-dialog">
            <div className="border-b border-gray-150 bg-gray-50 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">새로운 성도 등록</h3>
              <button onClick={() => setShowAddModal(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMemberSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">이름 (성함) *</label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="성함 기입"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">휴대폰 연락처 *</label>
                  <input
                    type="text"
                    required
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">생년월일 (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={newMember.birthDate}
                    onChange={(e) => setNewMember({ ...newMember, birthDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 font-bold text-emerald-800">소속 구역</label>
                  <select
                    value={newMember.district}
                    onChange={(e) => setNewMember({ ...newMember, district: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-emerald-500"
                  >
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">직분</label>
                  <select
                    value={newMember.duty}
                    onChange={(e) => setNewMember({ ...newMember, duty: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-emerald-500"
                  >
                    {duties.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 font-bold text-sky-850">세례 구분</label>
                  <select
                    value={newMember.baptism}
                    onChange={(e) => setNewMember({ ...newMember, baptism: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none"
                  >
                    {baptisms.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">교적 상태</label>
                  <select
                    value={newMember.status}
                    onChange={(e) => setNewMember({ ...newMember, status: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">가족 관계 그룹 ID (선택)</label>
                <input
                  type="text"
                  value={newMember.familyId}
                  onChange={(e) => setNewMember({ ...newMember, familyId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500"
                  placeholder="예: F101"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-250 text-gray-600 px-4 py-2 text-xs font-medium bg-white hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer"
                >
                  명부 영구 등록 마침
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MEMBER PROFILE PROFILE DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" id="member-profile-detail-modal">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Softr Header Style */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white px-6 py-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{selectedMember.id}교구 교번</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <h3 className="text-xl font-bold tracking-tight">{selectedMember.name}</h3>
                    <span className="text-xs bg-emerald-500 px-2 py-0.5 rounded font-semibold">{selectedMember.duty}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="rounded-lg p-1 bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              {!isEditingProfile ? (
                /* VIEWING CURRENT PROFILE & HISTORY LOGS */
                <>
                  {/* Personal details grid */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-5 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-xs text-gray-400 block pb-0.5">휴대폰 연락처</span>
                      <span className="text-sm font-semibold text-gray-900 font-mono flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-emerald-700" /> {selectedMember.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block pb-0.5">구역 정보</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedMember.district}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block pb-0.5">세례 이수 구분</span>
                      <span className="text-sm font-bold text-gray-900">{selectedMember.baptism}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block pb-0.5">가족 연동 ID</span>
                      <span className="text-sm font-semibold text-gray-700 font-mono">{selectedMember.familyId || '단독 세대'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block pb-0.5">성도 등록 날짜</span>
                      <span className="text-sm font-semibold text-gray-700 font-mono">{selectedMember.registeredAt}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block pb-0.5">생년월일 및 신원정보</span>
                      <span className="text-sm font-semibold text-gray-700 font-mono">{selectedMember.birthDate}</span>
                    </div>
                  </div>

                  {/* Attendance log stats */}
                  <div className="border-b border-gray-100 pb-4 space-y-2">
                    <span className="text-xs font-bold text-gray-500 block">예배 및 모임 최근 출석 이력 (5월)</span>
                    <div className="flex gap-2">
                      <div className="rounded-lg border border-gray-150 p-2.5 text-center bg-gray-50/50 w-1/2">
                        <span className="text-[10px] text-gray-400 block">5월 10일 대예배</span>
                        <span className={`text-xs font-bold ${selectedMember.attendance['2026-05-10'] ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {selectedMember.attendance['2026-05-10'] ? '● 출석완료' : '○ 결석'}
                        </span>
                      </div>
                      <div className="rounded-lg border border-gray-150 p-2.5 text-center bg-gray-50/50 w-1/2">
                        <span className="text-[10px] text-gray-400 block">5월 17일 대예배</span>
                        <span className={`text-xs font-bold ${selectedMember.attendance['2026-05-17'] ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {selectedMember.attendance['2026-05-17'] ? '● 출석완료' : '○ 결석'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Actions Drawer inside modal */}
                  <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-emerald-950">성도 대면 알림톡 원스톱 연동</p>
                      <p className="text-[10.5px] text-emerald-800">모바일 명부 수정 및 심방 예약 등 발송창 열기</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAlimtalk('general', selectedMember);
                        setSelectedMember(null);
                      }}
                      className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer text-center"
                    >
                      목양알림 발송
                    </button>
                  </div>
                </>
              ) : (
                /* EDITING PROFILE MODE */
                <form onSubmit={handleUpdateMemberSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">이름</label>
                      <input
                        type="text"
                        value={selectedMember.name}
                        onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">연락처</label>
                      <input
                        type="text"
                        value={selectedMember.phone}
                        onChange={(e) => setSelectedMember({ ...selectedMember, phone: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">생년월일</label>
                      <input
                        type="date"
                        value={selectedMember.birthDate}
                        onChange={(e) => setSelectedMember({ ...selectedMember, birthDate: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">직분</label>
                      <select
                        value={selectedMember.duty}
                        onChange={(e) => setSelectedMember({ ...selectedMember, duty: e.target.value as any })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                      >
                        {duties.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 font-bold text-emerald-800">구역 배정</label>
                      <select
                        value={selectedMember.district}
                        onChange={(e) => setSelectedMember({ ...selectedMember, district: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                      >
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">세례여부</label>
                      <select
                        value={selectedMember.baptism}
                        onChange={(e) => setSelectedMember({ ...selectedMember, baptism: e.target.value as any })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                      >
                        {baptisms.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">교적상태</label>
                      <select
                        value={selectedMember.status}
                        onChange={(e) => setSelectedMember({ ...selectedMember, status: e.target.value as any })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 justify-end border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="rounded-lg border border-gray-250 text-gray-650 px-4 py-2 text-xs font-semibold bg-white"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold"
                    >
                      교적부 정보 병합 저장
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer Controls */}
            {!isEditingProfile && (
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="rounded-lg border border-gray-200 hover:bg-white text-gray-700 px-4 py-2 text-xs font-bold bg-gray-50 transition-colors cursor-pointer"
                >
                  교인교적 편집수정
                </button>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  상세 닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
