import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';

/**
 * CvTemplateIt – giao diện form CV IT (履歴書 + 職務経歴書).
 * Props:
 *   formData, setFormData
 *   activeTab, setActiveTab
 *   cvEditable, cvEditableArray, cvEditableWithDefault
 *   getDefaultCvDate, updateEmployment, updateEmploymentPair, toggleShokumuCheckbox
 *   handleAddWorkExperience, handleAddShokumuTable, handleInsertWorkExperienceAt, handleInsertWorkExperienceBlockAt (bảng 職歴 Rirekisho / 職務経歴 Shokumu)
 *   handleBackendPreviewWithOptions, avatarPreview
 */
const CvTemplateIt = ({
  formData,
  setFormData,
  activeTab,
  setActiveTab,
  cvEditable,
  cvEditableArray,
  cvEditableWithDefault,
  getDefaultCvDate,
  updateEmployment,
  updateEmploymentPair,
  toggleShokumuCheckbox,
  handleAddWorkExperience,
  handleAddShokumuTable,
  handleInsertWorkExperienceAt,
  handleInsertWorkExperienceBlockAt,
  handleBackendPreviewWithOptions,
  avatarPreview,
}) => {
  return (
    <div style={{ fontFamily: '"MS PMincho", "MS Mincho", "Yu Mincho", "Hiragino Mincho ProN", serif' }}>
      {/* Tab buttons */}
      <div className="flex border-b mb-3 font-bold" style={{ borderColor: '#e5e7eb' }}>
        <button
          type="button"
          onClick={() => setActiveTab('rirekisho')}
          className="flex items-center gap-1 px-3 py-2 text-xs font-bold transition-colors"
          style={{
            color: activeTab === 'rirekisho' ? '#2563eb' : '#6b7280',
            borderBottom: activeTab === 'rirekisho' ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          【履歴書】フォーマット
          <ChevronDown className="w-3 h-3" style={{ color: 'inherit' }} />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shokumu')}
          className="flex items-center gap-1 px-3 py-2 text-xs font-bold transition-colors"
          style={{
            color: activeTab === 'shokumu' ? '#2563eb' : '#6b7280',
            borderBottom: activeTab === 'shokumu' ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          【職務経歴書】フォーマット
          <ChevronDown className="w-3 h-3" style={{ color: 'inherit' }} />
        </button>
      </div>

      {/* ===== 履歴書 ===== */}
      {activeTab === 'rirekisho' && (
        <div className="w-full">
          <div className="flex items-center justify-end mb-2">
            <button
              type="button"
              onClick={() => handleBackendPreviewWithOptions('cv_it', 'rirekisho')}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors"
              style={{ borderColor: '#d1d5db', color: '#2563eb' }}
            >
              Xem preview 【履歴書】
            </button>
          </div>
          <div className="w-full overflow-x-auto font-bold" style={{ fontSize: '11px', color: '#1f2937' }}>
            {/* Bảng thông tin cá nhân 5 dòng + ảnh */}
            <table className="w-full border-collapse" style={{ borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td colSpan={7} className="border p-2 text-center font-bold" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>履歴書</td>
                </tr>
                <tr>
                  <td className="border p-1 font-medium w-16 whitespace-nowrap text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '5rem', maxWidth: '5rem' }}>フリガナ</td>
                  <td className="border p-1.5 bg-white min-w-0" style={{ borderColor: '#1f2937' }}><span {...cvEditable('nameKana', '')} /></td>
                  <td className="border p-1 w-14 font-medium text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', maxWidth: '3.5rem' }}>生年月日</td>
                  <td className="border p-1 bg-white w-20" style={{ borderColor: '#1f2937', maxWidth: '5rem' }}><span {...cvEditable('birthDate', '')} title="YYYY-MM-DD" /></td>
                  <td className="border p-1 w-12 font-medium text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', maxWidth: '3rem' }}>年齢</td>
                  <td className="border p-1 bg-white w-14" style={{ borderColor: '#1f2937', maxWidth: '3.5rem' }}><span {...cvEditable('age', '')} /></td>
                  <td rowSpan={5} className="border p-2 align-middle text-center w-24" style={{ borderColor: '#1f2937', verticalAlign: 'middle' }}>
                    {avatarPreview ? (
                      <div style={{ height: '7.5rem', width: '5.625rem', overflow: 'hidden', margin: '0 auto' }}>
                        <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '3/4', display: 'block' }} />
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">&lt;顔写真&gt;</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="border p-1 font-medium w-16 whitespace-nowrap text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '5rem', maxWidth: '5rem' }}>氏名</td>
                  <td className="border p-1.5 bg-white min-w-0" style={{ borderColor: '#1f2937' }}><span {...cvEditable('nameKanji', '')} /></td>
                  <td className="border p-1 font-medium w-14 text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', maxWidth: '3.5rem' }}>性別</td>
                  <td className="border p-1 bg-white w-20" style={{ borderColor: '#1f2937', maxWidth: '5rem' }}>
                    <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={formData.gender === '男'} onChange={() => setFormData(prev => ({ ...prev, gender: '男' }))} /> 男</label>
                    <label className="flex items-center gap-1 text-xs cursor-pointer mt-0.5"><input type="checkbox" className="rounded" checked={formData.gender === '女'} onChange={() => setFormData(prev => ({ ...prev, gender: '女' }))} /> 女</label>
                  </td>
                  <td className="border p-1 font-medium w-16 text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', maxWidth: '4rem' }}>パスポート</td>
                  <td className="border p-1 bg-white w-20" style={{ borderColor: '#1f2937', maxWidth: '5rem' }}>
                    <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={formData.passport === '有' || formData.passport === '1'} onChange={() => setFormData(prev => ({ ...prev, passport: '有' }))} /> 有</label>
                    <label className="flex items-center gap-1 text-xs cursor-pointer mt-0.5"><input type="checkbox" className="rounded" checked={formData.passport === '無' || formData.passport === '0'} onChange={() => setFormData(prev => ({ ...prev, passport: '無' }))} /> 無</label>
                  </td>
                </tr>
                <tr>
                  <td className="border p-1 font-medium w-14 whitespace-nowrap text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '5rem', maxWidth: '5rem' }}>Email</td>
                  <td className="border p-1 bg-white min-w-0" style={{ borderColor: '#1f2937', maxWidth: '6rem' }}><span {...cvEditable('email', '')} /></td>
                  <td className="border p-1 font-medium w-12 text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', maxWidth: '3rem' }}>電話</td>
                  <td className="border p-1 bg-white w-20" style={{ borderColor: '#1f2937', maxWidth: '5rem' }}><span {...cvEditable('phone', '')} /></td>
                  <td className="border p-1 font-medium w-16 text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', maxWidth: '4rem' }}>Skype ID</td>
                  <td className="border p-1 bg-white w-20" style={{ borderColor: '#1f2937', maxWidth: '5rem' }}><span {...cvEditable('skypeId', '')} /></td>
                </tr>
                <tr>
                  <td className="border p-1 font-medium w-14 whitespace-nowrap text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '5rem', maxWidth: '5rem' }}>現住所</td>
                  <td className="border p-1 bg-white min-w-0" style={{ borderColor: '#1f2937', maxWidth: '6rem' }}><span {...cvEditable('address', '')} /></td>
                  <td className="border p-1 font-medium w-14 text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', maxWidth: '3.5rem' }}>出身地</td>
                  <td className="border p-1 bg-white w-20" style={{ borderColor: '#1f2937', maxWidth: '5rem' }}><span {...cvEditable('addressOrigin', '')} /></td>
                  <td className="border p-1 font-medium w-14 text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', maxWidth: '3.5rem' }}>配偶者</td>
                  <td className="border p-1 bg-white w-20" style={{ borderColor: '#1f2937', maxWidth: '5rem' }}>
                    <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={formData.hasSpouse === '有'} onChange={() => setFormData(prev => ({ ...prev, hasSpouse: '有' }))} /> 有</label>
                    <label className="flex items-center gap-1 text-xs cursor-pointer mt-0.5"><input type="checkbox" className="rounded" checked={formData.hasSpouse === '無'} onChange={() => setFormData(prev => ({ ...prev, hasSpouse: '無' }))} /> 無</label>
                  </td>
                </tr>
                <tr>
                  <td className="border p-1 font-medium w-20 whitespace-nowrap text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '5rem', maxWidth: '5rem' }}>日本滞在目的</td>
                  <td className="border p-1 bg-white min-w-0" style={{ borderColor: '#1f2937', maxWidth: '12rem' }} colSpan={3}>
                    <div className="flex flex-wrap justify-evenly gap-x-2 gap-y-1 items-center">
                      {['技能', '留学生', '企業内転', '技術人文', '研修'].map(label => (
                        <label key={label} className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={formData.stayPurpose === label}
                            onChange={() => setFormData(prev => ({ ...prev, stayPurpose: prev.stayPurpose === label ? '' : label }))}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="border p-1 font-medium w-16 text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', maxWidth: '4rem' }}>ビザの期限</td>
                  <td className="border p-1 bg-white w-20" style={{ borderColor: '#1f2937', maxWidth: '5rem' }}><span {...cvEditable('visaExpirationDate', '')} /></td>
                </tr>
              </tbody>
            </table>

            {/* Bảng 学歴 */}
            <table className="w-full border-collapse mt-3 font-bold" style={{ fontSize: '11px', color: '#1f2937', borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td rowSpan={1 + Math.max(1, (formData.educations || []).length)} className="border p-2 text-center align-middle" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '5rem' }}>学歴</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>学校名 (英語名)</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>学部・専攻</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>入学年月 (y/m)</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>卒業年月 (y/m)</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>年数</td>
                </tr>
                {Array.from({ length: Math.max(1, (formData.educations || []).length) }).map((_, i) => {
                  const edu = formData.educations?.[i] || {};
                  return (
                    <tr key={`gakureki-${i}`}>
                      <td className="border p-1.5 bg-white" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('educations', i, 'school_name', 'block')} /></td>
                      <td className="border p-1.5 bg-white" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('educations', i, 'major', 'block')} /></td>
                      <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}>
                        <span {...cvEditableArray('educations', i, 'year', 'block', {}, (edu.year || edu.month) ? `${edu.year || ''}/${edu.month || ''}` : '')} />
                      </td>
                      <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}>
                        <span {...cvEditableArray('educations', i, 'endYear', 'block', {}, (edu.endYear || edu.endMonth) ? `${edu.endYear || ''}/${edu.endMonth || ''}` : '')} />
                      </td>
                      <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}>　</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Bảng 外国語の会話レベル */}
            <table className="w-full border-collapse mt-3 font-bold" style={{ fontSize: '11px', color: '#1f2937', borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td rowSpan={4} className="border p-2 text-center align-middle" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '5rem' }}>外国語の会話レベル</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>日本語</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>英語</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>その他 ( )</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '10rem' }}>言語スキル補足説明</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '10rem' }}>備考</td>
                </tr>
                {[
                  { value: 'native', label: 'ネイティブ', borderCls: 'border-t border-l border-r' },
                  { value: 'business', label: 'ビジネス', borderCls: 'border-l border-r' },
                  { value: 'daily', label: '日常会話', borderCls: 'border-l border-r border-b' },
                ].map(({ value, label, borderCls }, rowIdx) => (
                  <tr key={value}>
                    {['jpConversationLevel', 'enConversationLevel', 'otherConversationLevel'].map(field => (
                      <td key={field} className={`${borderCls} p-1.5 bg-white`} style={{ borderColor: '#1f2937' }}>
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={formData[field] === value}
                            onChange={() => setFormData(prev => ({ ...prev, [field]: prev[field] === value ? '' : value }))}
                          />
                          ・{label}
                        </label>
                      </td>
                    ))}
                    {rowIdx === 0 && (
                      <>
                        <td rowSpan={3} className="border p-1.5 bg-white text-center align-middle" style={{ borderColor: '#1f2937', width: '10rem' }}><span {...cvEditable('languageSkillRemarks', '')} /></td>
                        <td rowSpan={3} className="border p-1.5 bg-white align-middle" style={{ borderColor: '#1f2937', width: '10rem' }}><span {...cvEditable('remarks', '')} /></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bảng 保有資格・免許等 */}
            <table className="w-full border-collapse mt-3 font-bold" style={{ fontSize: '11px', color: '#1f2937', borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td rowSpan={5} className="border p-2 text-center align-middle" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '5rem' }}>保有資格・免許等</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '6rem', minWidth: '6rem' }}></td>
                  <td colSpan={4} className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>名称</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>取得年月</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>名称</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>取得年月</td>
                </tr>
                <tr>
                  <td className="border p-1.5 text-center align-middle bg-white" style={{ borderColor: '#1f2937', width: '6rem', minWidth: '6rem' }}>日本語検定</td>
                  {['N1', 'N2', 'N3', 'N4'].map(n => (
                    <td key={n} className="border p-1 bg-white text-center" style={{ borderColor: '#1f2937', width: '2rem', maxWidth: '2.5rem' }}>
                      <label className="flex items-center justify-center gap-0.5 text-xs cursor-pointer">
                        <input type="checkbox" className="rounded" checked={formData.jlptLevel === n || formData.jlptLevel === n.replace('N', '')} onChange={() => setFormData(prev => ({ ...prev, jlptLevel: n }))} /> {n}
                      </label>
                    </td>
                  ))}
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 0, 'yearMonth', 'block')} /></td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 0, 'name', 'block')} /></td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 1, 'yearMonth', 'block')} /></td>
                </tr>
                <tr>
                  <td rowSpan={2} className="border p-1.5 text-center align-middle bg-white" style={{ borderColor: '#1f2937', width: '6rem', minWidth: '6rem' }}>英語</td>
                  <td colSpan={4} className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}>
                    <span contentEditable suppressContentEditableWarning className="outline-none min-h-[1.2em] block"
                      onBlur={(e) => { const m = (e.currentTarget.textContent || '').match(/(\d+)/); setFormData(prev => ({ ...prev, toeicScore: m ? m[1] : '' })); }}>
                      {`TOEIC (${(formData.toeicScore || '').trim() || '　　　'}点)`}
                    </span>
                  </td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 2, 'yearMonth', 'block')} /></td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 2, 'name', 'block')} /></td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 3, 'yearMonth', 'block')} /></td>
                </tr>
                <tr>
                  <td colSpan={4} className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}>
                    <span contentEditable suppressContentEditableWarning className="outline-none min-h-[1.2em] block"
                      onBlur={(e) => { const m = (e.currentTarget.textContent || '').match(/(\d+\.?\d*)/); setFormData(prev => ({ ...prev, ieltsScore: m ? m[1] : '' })); }}>
                      {`IELTS (${(formData.ieltsScore || '').trim() || '　　　'}点)`}
                    </span>
                  </td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 4, 'yearMonth', 'block')} /></td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 4, 'name', 'block')} /></td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 5, 'yearMonth', 'block')} /></td>
                </tr>
                <tr>
                  <td className="border p-1.5 text-center align-middle bg-white" style={{ borderColor: '#1f2937', width: '6rem', minWidth: '6rem' }}>自動車免許</td>
                  <td colSpan={2} className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}>
                    <label className="flex items-center justify-center gap-1 text-xs cursor-pointer">
                      <input type="checkbox" className="rounded"
                        checked={formData.hasDrivingLicense === '1' || formData.hasDrivingLicense === '有る'}
                        onChange={() => setFormData(prev => ({ ...prev, hasDrivingLicense: (prev.hasDrivingLicense === '1' || prev.hasDrivingLicense === '有る') ? '' : '1' }))}
                      /> 有る
                    </label>
                  </td>
                  <td colSpan={2} className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}>
                    <label className="flex items-center justify-center gap-1 text-xs cursor-pointer">
                      <input type="checkbox" className="rounded"
                        checked={formData.hasDrivingLicense === '0' || formData.hasDrivingLicense === '無し'}
                        onChange={() => setFormData(prev => ({ ...prev, hasDrivingLicense: (prev.hasDrivingLicense === '0' || prev.hasDrivingLicense === '無し') ? '' : '0' }))}
                      /> 無し
                    </label>
                  </td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 6, 'yearMonth', 'block')} /></td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 6, 'name', 'block')} /></td>
                  <td className="border p-1.5 bg-white text-center" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', 7, 'yearMonth', 'block')} /></td>
                </tr>
              </tbody>
            </table>

            {/* Bảng 職歴 + 自己PR + 応募動機 + 備考 – mặc định 1 hàng, có nút 行を追加 và 挿入 */}
            <table className="w-full border-collapse mt-3 font-bold" style={{ fontSize: '11px', color: '#1f2937', borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '10rem', maxWidth: '10rem' }}>期間</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', minWidth: '9rem' }}>就業先</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', minWidth: '14rem' }}>企業名</td>
                  <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '8rem', maxWidth: '8rem' }}>ポジション・役割</td>
                </tr>
                {(() => {
                  const list = formData.workExperiences || [];
                  const workCount = Math.max(1, formData.workHistoryCount ?? Math.ceil(list.length / 2));
                  const cellEditStyle = { outline: 'none', minHeight: '1em', minWidth: '1.5em', display: 'inline-block', cursor: 'text' };
                  return Array.from({ length: workCount }).map((_, i) => {
                    const baseIdx = i * 2;
                    const row0 = list[baseIdx] || {};
                    const row1 = list[baseIdx + 1] || {};
                    const periodDisplay = row0.period || row1.period || '';
                    const companyNameDisplay = (row0.company_name || row1.company_name || '').replace(/\s*入社\s*$|\s*退社\s*$/g, '').trim();
                    const employmentPlaceDisplay = row0.employmentPlace || row1.employmentPlace || '';
                    const descriptionDisplay = row0.description || row1.description || '';
                    return (
                      <React.Fragment key={`shokureki-${i}`}>
                        <tr>
                          <td className="border p-1.5 bg-white text-center align-middle" style={{ borderColor: '#1f2937', width: '10rem', maxWidth: '10rem' }}>
                            <span contentEditable suppressContentEditableWarning onBlur={(e) => (updateEmploymentPair || updateEmployment)(i, 'period', (e.currentTarget.textContent || '').trim())} style={cellEditStyle}>{periodDisplay || '　'}</span>
                          </td>
                          <td className="border p-1.5 bg-white text-center align-middle" style={{ borderColor: '#1f2937', minWidth: '9rem' }}>
                            <span contentEditable suppressContentEditableWarning onBlur={(e) => (updateEmploymentPair || updateEmployment)(i, 'employmentPlace', (e.currentTarget.textContent || '').trim())} style={cellEditStyle}>{employmentPlaceDisplay || '　'}</span>
                          </td>
                          <td className="border p-1.5 bg-white text-center align-middle" style={{ borderColor: '#1f2937', minWidth: '14rem' }}>
                            <span contentEditable suppressContentEditableWarning onBlur={(e) => (updateEmploymentPair || updateEmployment)(i, 'company_name', (e.currentTarget.textContent || '').trim())} style={cellEditStyle}>{companyNameDisplay || '　'}</span>
                          </td>
                          <td className="border p-1.5 bg-white text-center align-middle" style={{ borderColor: '#1f2937', width: '8rem', maxWidth: '8rem' }}>
                            <span contentEditable suppressContentEditableWarning onBlur={(e) => (updateEmploymentPair || updateEmployment)(i, 'description', (e.currentTarget.textContent || '').trim())} style={cellEditStyle}>{descriptionDisplay || '　'}</span>
                          </td>
                        </tr>
                        {i < workCount - 1 && handleInsertWorkExperienceBlockAt && (
                          <tr>
                            <td colSpan={4} className="border p-0.5 text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f3f4f6' }}>
                              <button type="button" onClick={() => handleInsertWorkExperienceBlockAt(i + 1)} className="text-xs text-amber-600 hover:text-amber-800">挿入</button>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  });
                })()}
                <tr>
                  <td colSpan={4} className="border p-1 text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                    {handleAddWorkExperience && (
                      <button type="button" onClick={handleAddWorkExperience} className="text-xs flex items-center justify-center gap-1 mx-auto text-blue-600 hover:text-blue-800">
                        <Plus className="w-3.5 h-3.5" /> 行を追加
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="border p-1.5 font-medium text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>自己PR (大学での成績順位、頑張ったこと、趣味等)</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border p-2 bg-white align-top min-h-[80px]" style={{ borderColor: '#1f2937' }}><span {...cvEditable('strengths', 'block', { minHeight: '80px' })}>{formData.strengths || formData.careerSummary || formData.hobbiesSpecialSkills || '　'}</span></td>
                </tr>
                <tr>
                  <td colSpan={4} className="border p-1.5 font-medium text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>応募動機</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border p-2 bg-white align-top" style={{ borderColor: '#1f2937', minHeight: '80px' }}>{formData.motivation || '　'}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border p-1.5 font-medium text-center" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9' }}>備考</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border p-2 bg-white align-top" style={{ borderColor: '#1f2937', fontSize: '10px' }}>
                    <div className="space-y-1">
                      <div>・現年収: {formData.currentSalary || '　'}</div>
                      <div>・希望年収: {formData.desiredSalary || '　'}</div>
                      <div>・希望職種: {formData.desiredPosition || '　'}</div>
                      <div>・希望勤務地: {formData.desiredLocation || '　'}</div>
                      <div>・在留資格の種類: 技術・人文知識・国際業務</div>
                      <div>・在留期間: {formData.visaExpirationDate || '年月日'}</div>
                      <div>・在留カードに記載の就労制限:「在留資格に基づく就労活動のみ可」</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== 職務経歴書 (CV IT) ===== */}
      {activeTab === 'shokumu' && (
        <div className="w-full">
          <div className="flex items-center justify-end mb-2">
            <button type="button" onClick={() => handleBackendPreviewWithOptions('cv_it', 'shokumu')}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors"
              style={{ borderColor: '#d1d5db', color: '#2563eb' }}>
              Xem preview 【職務経歴書】
            </button>
          </div>
          <div className="rounded border p-4 min-h-[200px]" style={{ borderColor: '#e5e7eb', fontSize: '11px', color: '#1f2937' }}>
            <div className="mb-6">
              <h2 className="text-center font-bold mb-8" style={{ fontSize: '1.25rem' }}>職務経歴書</h2>
              <div className="text-right space-y-1">
                <div>現在、<span {...cvEditableWithDefault('cvDocumentDate', getDefaultCvDate(false), 'inline-block min-w-[8em]', {}, (v) => (v || '').replace(/現在$/, ''))} /></div>
                <div>氏名: <span {...cvEditable('nameKanji', '')} /> (<span {...cvEditable('nameKana', '')} />)</div>
              </div>
            </div>

            {/* 職務要約 */}
            <table className="w-full border-collapse font-bold mt-4" style={{ fontSize: '11px', color: '#1f2937', borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td className="border p-2 text-center align-middle" style={{ borderColor: '#1f2937', backgroundColor: '#e2efd9', width: '12%' }}>職務要約</td>
                  <td className="border p-3 bg-white align-top" style={{ borderColor: '#1f2937' }}>
                    <div className="whitespace-pre-wrap min-h-[4rem]" {...cvEditable('careerSummary', 'block')} />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 職務経歴 – IT: 1 block = 1 công ty (cặp 入社/退社). Số block = workHistoryCount ?? ceil(workList.length/2). */}
            {(() => {
              const workList = formData.workExperiences || [];
              const blockCount = Math.max(1, formData.workHistoryCount ?? Math.ceil(workList.length / 2));
              const tableCount = Math.max(1, Math.ceil(blockCount / 2));
              const circleNum = (n) => ({ 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤', 6: '⑥', 7: '⑦', 8: '⑧', 9: '⑨', 10: '⑩' }[n] || `(${n})`);
              const cellStyle = { borderWidth: '1px', borderStyle: 'dotted', borderColor: '#9ca3af' };

              const roles = (w) => (w?.roleCheckboxes && Array.isArray(w.roleCheckboxes) ? w.roleCheckboxes : []);
              const processes = (w) => (w?.processCheckboxes && Array.isArray(w.processCheckboxes) ? w.processCheckboxes : []);
              const renderBlock = (blockIdx, baseBlockIdx) => {
                const blockIndex = baseBlockIdx + blockIdx;
                const wi = blockIndex * 2;
                const w = workList[wi] || {};
                const roleSet = roles(w);
                const processSet = processes(w);
                const chk = (type, key) => (type === 'role' ? roleSet.includes(key) : processSet.includes(key));
                const onChk = (type, key) => toggleShokumuCheckbox ? () => toggleShokumuCheckbox(wi, type, key) : undefined;
                const blockRowSpan = 9 + (blockIdx > 0 ? 1 : 0);
                return (
                <React.Fragment key={blockIdx}>
                  {blockIdx > 0 && (
                    <tr>
                      <td className="border p-1.5 text-center font-medium" style={{ ...cellStyle, borderTopStyle: 'solid', borderBottomStyle: 'solid', borderTopColor: '#1f2937', borderBottomColor: '#1f2937', backgroundColor: '#e2efd9', minWidth: '35%' }}>業務内容 (具体的、詳細に記入)</td>
                      <td className="border p-1.5 text-center font-medium" style={{ ...cellStyle, borderTopStyle: 'solid', borderBottomStyle: 'solid', borderTopColor: '#1f2937', borderBottomColor: '#1f2937', backgroundColor: '#e2efd9', width: '22%' }}>役割・担当業務</td>
                      <td className="border p-1.5 text-center font-medium" style={{ ...cellStyle, borderTopStyle: 'solid', borderBottomStyle: 'solid', borderTopColor: '#1f2937', borderBottomColor: '#1f2937', backgroundColor: '#e2efd9', width: '20%' }}>作業工程</td>
                    </tr>
                  )}
                  <tr>
                    <td rowSpan={blockRowSpan} className="border p-2 align-top bg-white" style={{ borderColor: '#1f2937', width: '18%', verticalAlign: 'top', borderRightStyle: 'solid', borderRightColor: '#1f2937' }}>
                      <div className="text-xs whitespace-pre-wrap" {...cvEditableArray('workExperiences', wi, 'company_name', 'text-xs whitespace-pre-wrap', {}, workList[wi]?.company_name)} />
                    </td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}>
                      <div className="grid grid-cols-[auto_1fr] gap-x-2 items-center text-xs">
                        <span>【期間】{circleNum(blockIdx + 1)}</span>
                        <span {...cvEditableArray('workExperiences', wi, 'period', 'block', {}, workList[wi]?.period)} />
                      </div>
                    </td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('role', 'PM')} onChange={onChk('role', 'PM')} /> ・PM</label></td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('process', '要件定義')} onChange={onChk('process', '要件定義')} /> ・要件定義</label></td>
                  </tr>
                  <tr>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}>
                      <div className="grid grid-cols-[auto_1fr] gap-x-2 items-center text-xs">
                        <span>【プロジェクト名】</span>
                        <span {...cvEditableArray('workExperiences', wi, 'business_purpose', 'block', {}, workList[wi]?.business_purpose)} />
                      </div>
                    </td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('role', 'PL')} onChange={onChk('role', 'PL')} /> ・PL</label></td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('process', '基本設計')} onChange={onChk('process', '基本設計')} /> ・基本設計</label></td>
                  </tr>
                  <tr>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}>
                      <div className="grid grid-cols-[auto_1fr] gap-x-2 items-center text-xs">
                        <span>【チーム人数】</span>
                        <span {...cvEditableArray('workExperiences', wi, 'scale_role', 'block', {}, workList[wi]?.scale_role)} />
                      </div>
                    </td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('role', 'サブリーダー')} onChange={onChk('role', 'サブリーダー')} /> ・サブリーダー</label></td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('process', '詳細設計')} onChange={onChk('process', '詳細設計')} /> ・詳細設計</label></td>
                  </tr>
                  <tr>
                    <td rowSpan={5} className="p-1.5 align-top bg-white" style={cellStyle}>
                      <div className="text-xs mb-1">【担当業務】</div>
                      <div className="text-xs min-h-[4rem]" {...cvEditableArray('workExperiences', wi, 'description', 'text-xs min-h-[4rem]', {}, workList[wi]?.description)} />
                    </td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('role', 'プログラマー')} onChange={onChk('role', 'プログラマー')} /> ・プログラマー</label></td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('process', '実装・単体')} onChange={onChk('process', '実装・単体')} /> ・実装・単体</label></td>
                  </tr>
                  <tr>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('role', 'BrSE')} onChange={onChk('role', 'BrSE')} /> ・BrSE</label></td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('process', '結合テスト')} onChange={onChk('process', '結合テスト')} /> ・結合テスト</label></td>
                  </tr>
                  <tr>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('role', 'その他')} onChange={onChk('role', 'その他')} /> ・その他</label></td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('process', '総合テスト')} onChange={onChk('process', '総合テスト')} /> ・総合テスト</label></td>
                  </tr>
                  <tr>
                    <td className="p-1.5 align-top bg-white pl-4 text-gray-500" style={cellStyle}><span className="text-xs">(テスター)</span></td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" className="rounded" checked={chk('process', '保守・運用')} onChange={onChk('process', '保守・運用')} /> ・保守・運用</label></td>
                  </tr>
                  <tr>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}>　</td>
                    <td className="p-1.5 align-top bg-white" style={cellStyle}>　</td>
                  </tr>
                </React.Fragment>
                );
              };

              return (
                <div className="space-y-4">
                  {Array.from({ length: tableCount }, (_, tableIdx) => {
                    const baseBlockIdx = tableIdx * 2;
                    const blockCountInTable = Math.min(2, blockCount - baseBlockIdx);
                    return (
                      <div key={tableIdx} className="border" style={{ borderColor: '#1f2937' }}>
                        <div className="p-2 text-center font-bold" style={{ backgroundColor: '#e2efd9', color: '#1f2937' }}>職務経歴</div>
                        <table className="w-full border-collapse font-bold" style={{ fontSize: '11px', color: '#1f2937', borderColor: '#1f2937' }}>
                          <thead>
                            <tr>
                              <td className="border p-1.5 text-center font-medium" style={{ borderColor: '#1f2937', borderBottomStyle: 'solid', borderBottomColor: '#1f2937', backgroundColor: '#e2efd9' }}>就業先</td>
                              <td className="border p-1.5 text-center font-medium" style={{ borderStyle: 'dotted', borderColor: '#9ca3af', borderTopStyle: 'solid', borderBottomStyle: 'solid', borderTopColor: '#1f2937', borderBottomColor: '#1f2937', backgroundColor: '#e2efd9', minWidth: '35%' }}>業務内容 (具体的、詳細に記入)</td>
                              <td className="border p-1.5 text-center font-medium" style={{ borderStyle: 'dotted', borderColor: '#9ca3af', borderTopStyle: 'solid', borderBottomStyle: 'solid', borderTopColor: '#1f2937', borderBottomColor: '#1f2937', backgroundColor: '#e2efd9', width: '22%' }}>役割・担当業務</td>
                              <td className="border p-1.5 text-center font-medium" style={{ borderStyle: 'dotted', borderColor: '#9ca3af', borderTopStyle: 'solid', borderBottomStyle: 'solid', borderTopColor: '#1f2937', borderBottomColor: '#1f2937', backgroundColor: '#e2efd9', width: '20%' }}>作業工程</td>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: blockCountInTable }, (_, blockIdx) => renderBlock(blockIdx, baseBlockIdx))}
                            <tr>
                              <td colSpan={3} className="p-1.5 align-middle bg-gray-50 text-center" style={cellStyle}>
                                {handleAddWorkExperience ? (
                                  <button type="button" onClick={handleAddWorkExperience} className="text-xs text-blue-600 hover:text-blue-800 underline">
                                    行を追加
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400">行を追加</span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-3">
                    {handleAddShokumuTable ? (
                      <button type="button" onClick={handleAddShokumuTable} className="text-xs px-3 py-1.5 rounded border border-blue-500 text-blue-600 hover:bg-blue-50">
                        表を追加
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">表を追加</span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 活かせるスキル + 資格・免許 */}
            <div className="mt-4 border" style={{ borderColor: '#1f2937' }}>
              <table className="w-full border-collapse" style={{ borderColor: '#1f2937' }}>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 font-medium text-left align-middle" style={{ backgroundColor: '#e2efd9', color: '#1f2937', borderWidth: '1px', borderBottomWidth: '1px', borderColor: '#1f2937' }}>活かせるスキル・経験・知識</td>
                  </tr>
                  <tr>
                    <td className="min-h-[8rem] p-3 text-xs whitespace-pre-wrap bg-white align-top" style={{ borderColor: '#1f2937', borderWidth: '0 1px 1px 1px' }}><span {...cvEditable('technicalSkills', 'block', { minHeight: '8rem' })}>{formData.technicalSkills || formData.hobbiesSpecialSkills || '　'}</span></td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-left align-middle" style={{ backgroundColor: '#e2efd9', color: '#1f2937', borderWidth: '1px', borderColor: '#1f2937' }}>資格・免許</td>
                  </tr>
                  <tr>
                    <td className="min-h-[4rem] p-3 text-xs whitespace-pre-wrap bg-white align-top" style={{ borderColor: '#1f2937', borderWidth: '0 1px 1px 1px' }}><span {...cvEditable('qualification', 'block', { minHeight: '4rem' })}>{formData.qualification || '・TOEIC: 400点 (2015年4月)\n・日本語能力: JLPT N2 (2016年7月)'}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CvTemplateIt;
