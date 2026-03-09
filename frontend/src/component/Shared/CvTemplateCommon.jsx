import React from 'react';
import { Plus } from 'lucide-react';

/**
 * CvTemplateCommon – giao diện form CV Template chung (履歴書 + 職務経歴書).
 * Props:
 *   formData, setFormData
 *   cvFormatTab, setCvFormatTab
 *   cvEditable, cvEditableArray, cvEditableWithDefault
 *   getDefaultCvDate
 *   handleAddEducation, handleAddWorkExperience, handleAddCertificate
 *   handleInsertEducationAt, handleInsertWorkExperienceAt, handleInsertCertificateAt
 *   handleBackendPreviewWithOptions
 *   avatarPreview
 */
const CvTemplateCommon = ({
  formData,
  cvFormatTab,
  setCvFormatTab,
  cvEditable,
  cvEditableArray,
  cvEditableWithDefault,
  getDefaultCvDate,
  handleAddEducation,
  handleAddWorkExperience,
  handleAddCertificate,
  handleInsertEducationAt,
  handleInsertWorkExperienceAt,
  handleInsertCertificateAt,
  handleBackendPreviewWithOptions,
  avatarPreview,
}) => {
  return (
    <>
      {/* Tab buttons */}
      <div className="flex border-b mb-3" style={{ borderColor: '#e5e7eb' }}>
        <button
          type="button"
          onClick={() => setCvFormatTab('rirekisho')}
          className="px-3 py-2 text-xs font-medium transition-colors"
          style={{
            color: cvFormatTab === 'rirekisho' ? '#2563eb' : '#6b7280',
            borderBottom: cvFormatTab === 'rirekisho' ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          【履歴書】フォーマット
        </button>
        <button
          type="button"
          onClick={() => setCvFormatTab('shokumu')}
          className="px-3 py-2 text-xs font-medium transition-colors"
          style={{
            color: cvFormatTab === 'shokumu' ? '#2563eb' : '#6b7280',
            borderBottom: cvFormatTab === 'shokumu' ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          【職務経歴書】フォーマット
        </button>
      </div>

      {/* ===== 履歴書 ===== */}
      {cvFormatTab === 'rirekisho' && (
        <div className="w-full">
          <div className="flex items-center justify-end mb-2">
            <button
              type="button"
              onClick={() => handleBackendPreviewWithOptions('common', 'rirekisho')}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors"
              style={{ borderColor: '#d1d5db', color: '#2563eb' }}
            >
              Xem preview 【履歴書】
            </button>
          </div>
          <div
            className="mx-auto w-full overflow-hidden"
            style={{ fontSize: '11px', color: '#1f2937', fontFamily: "'MS Mincho', 'MS 明朝', 'Yu Mincho', 'Hiragino Mincho ProN', serif" }}
          >
            {/* Header */}
            <div className="flex w-full">
              <div className="px-3 pt-1 pb-3" style={{ width: '75%' }}>
                <div className="flex justify-start">
                  <h2 className="font-bold" style={{ fontSize: '18px', lineHeight: '1.1', transform: 'translateY(-2px)' }}>
                    履歴書
                  </h2>
                </div>
                <div className="text-xs text-center mt-1">
                  <span {...cvEditableWithDefault('cvDocumentDate', getDefaultCvDate(true), 'inline-block min-w-[8em]')} />
                </div>
              </div>
              <div style={{ width: '25%' }} />
            </div>

            {/* Bảng thông tin cá nhân */}
            <table className="w-full border-collapse" style={{ borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td className="border align-top p-1.5" style={{ width: '75%', borderColor: '#1f2937', minHeight: '7.5rem' }}>
                    <div className="mb-1 text-xs text-gray-600">ふりがな</div>
                    <div {...cvEditable('nameKana', 'border-t border-dotted border-gray-400 px-0.5 text-[10px]', { lineHeight: '1' })} />
                    <div className="mt-4 mb-1 text-xs text-gray-600">氏名</div>
                    <div {...cvEditable('nameKanji', 'min-h-[5.5em] px-1')} />
                  </td>
                  <td className="align-top border-0 border-none bg-transparent align-middle pl-2 pt-1.5" style={{ border: 'none', background: 'transparent', width: '25%' }}>
                    {avatarPreview ? (
                      <div style={{ height: '7.5rem', width: '5.625rem', overflow: 'hidden' }}>
                        <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '3/4', display: 'block' }} />
                      </div>
                    ) : null}
                  </td>
                </tr>
                <tr>
                  <td className="border px-1.5 py-2.5 align-middle" style={{ width: '75%', borderColor: '#1f2937' }}>
                    <div className="flex items-center flex-wrap gap-x-1 gap-y-1">
                      <span className="text-xs text-gray-600 flex-shrink-0">生年月日</span>
                      <span className="min-w-[2.5em] px-0.5 text-center" {...cvEditable('birthDate', '')} title="YYYY-MM-DD" />
                      <span className="ml-1">(満</span>
                      <span className="min-w-[1.2em] px-0.5 text-center" {...cvEditable('age', '')} />
                      <span>歳)</span>
                    </div>
                  </td>
                  <td className="border align-top p-1.5" style={{ borderColor: '#1f2937' }}>
                    <div className="mb-1 text-xs text-gray-600">※性別</div>
                    <div className="flex items-center justify-center gap-2 min-h-[1.6em]">
                      <span className={formData.gender === '男' ? 'font-semibold' : 'text-gray-400'}>男</span>
                      <span className="text-gray-400">・</span>
                      <span className={formData.gender === '女' ? 'font-semibold' : 'text-gray-400'}>女</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-t border-l border-r p-1.5 align-top" style={{ width: '75%', borderColor: '#1f2937' }}>
                    <div className="mb-1 text-xs text-gray-600">ふりがな</div>
                    <div {...cvEditable('addressFurigana', 'border-t border-dotted border-gray-400 px-0.5 text-[10px]', { lineHeight: '1' })} />
                    <div className="flex items-center min-h-[3.5rem] flex-wrap">
                      <span className="text-xs text-gray-600 flex-shrink-0 w-[4.25rem]">現住所</span>
                      <span className="flex-shrink-0 ml-5">〒</span>
                      <span className="min-w-[4em] px-0.5 flex-shrink-0" {...cvEditable('postalCode', '')} />
                      <span className="flex-1 min-h-[2.5em] px-1 flex items-center">
                        <span {...cvEditable('address', 'flex-1 min-h-[2.5em]')} />
                      </span>
                    </div>
                  </td>
                  <td className="border align-top p-1.5" style={{ borderColor: '#1f2937' }}>
                    <div className="mb-1 text-xs text-gray-600">電話</div>
                    <div className="min-h-[2em] px-1" {...cvEditable('phone', '')} />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="border px-1.5 py-2 align-middle" style={{ borderColor: '#1f2937' }}>
                    <div className="flex items-center w-full">
                      <span className="text-xs text-gray-600 flex-shrink-0 mr-2">E-mail</span>
                      <span className="flex-1 min-h-[1.5em] px-2" {...cvEditable('email', '')} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-t border-l border-r p-1.5 align-top" style={{ width: '75%', borderColor: '#1f2937' }}>
                    <div className="mb-1 text-xs text-gray-600">ふりがな</div>
                    <div {...cvEditable('contactFurigana', 'border-t border-dotted border-gray-400 px-0.5 text-[10px]', { lineHeight: '1' })} />
                  </td>
                  <td rowSpan={2} className="border p-1.5 align-top" style={{ borderColor: '#1f2937' }}>
                    <div className="mb-1 text-xs text-gray-600">電話</div>
                    <div className="min-h-[3rem] px-1" {...cvEditable('phone', '')} />
                  </td>
                </tr>
                <tr>
                  <td className="border p-1.5 align-top" style={{ width: '75%', borderColor: '#1f2937', borderTop: 'none' }}>
                    <div className="flex items-baseline flex-wrap gap-x-1 gap-y-1">
                      <span className="text-xs text-gray-600 flex-shrink-0 w-[4.25rem]">連絡先</span>
                      <span className="flex-shrink-0 ml-5">〒</span>
                      <span className="text-[10px] text-gray-500 flex-shrink-0 ml-10">(現住所以外に連絡を希望する場合のみ記入)</span>
                    </div>
                    <div className="border-b border-dotted border-gray-400 mt-1 min-h-[1.5em] px-1 text-xs flex flex-wrap gap-x-1">
                      <span {...cvEditable('contactPostalCode', '')} />
                      <span {...cvEditable('contactAddress', '')} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bảng liền: 学歴 + 職歴 + 免許・資格 */}
            {(() => {
              const eduCount = Math.max(1, (formData.educations || []).length);
              const workCount = Math.max(1, (formData.workExperiences || []).length);
              const certCount = Math.max(1, (formData.certificates || []).length);
              return (
                <table className="w-full border-collapse mt-4" style={{ borderColor: '#1f2937' }}>
                  <tbody>
                    {/* 学歴 */}
                    <tr>
                      <th className="border p-1.5 text-xs font-normal text-center" style={{ borderColor: '#1f2937', width: '8%' }}>年</th>
                      <th className="border p-1.5 text-xs font-normal text-center" style={{ borderColor: '#1f2937', width: '8%' }}>月</th>
                      <th className="border p-1.5 text-xs font-normal text-center" style={{ borderColor: '#1f2937' }}>学歴</th>
                    </tr>
                    {Array.from({ length: eduCount }).map((_, i) => {
                      const edu = formData.educations?.[i] || {};
                      const schoolMajor = edu.school_name
                        ? [edu.school_name, edu.major].filter(Boolean).join(' ')
                        : (edu.content || '');
                      const hasEndDate = !!(edu.endYear || edu.endMonth);
                      return (
                        <React.Fragment key={`edu-${i}`}>
                          {hasEndDate ? (
                            <>
                              <tr>
                                <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('educations', i, 'year', 'block')} /></td>
                                <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('educations', i, 'month', 'block')} /></td>
                                <td className="border p-1.5 text-xs" style={{ borderColor: '#1f2937' }}>
                                  <span {...cvEditableArray('educations', i, 'content', 'block', {}, schoolMajor)} /> 入学
                                </td>
                              </tr>
                              <tr>
                                <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('educations', i, 'endYear', 'block')} /></td>
                                <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('educations', i, 'endMonth', 'block')} /></td>
                                <td className="border p-1.5 text-xs" style={{ borderColor: '#1f2937' }}>
                                  <span {...cvEditableArray('educations', i, 'content', 'block', {}, schoolMajor)} /> 卒業
                                </td>
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('educations', i, 'year', 'block')} /></td>
                              <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('educations', i, 'month', 'block')} /></td>
                              <td className="border p-1.5 text-xs" style={{ borderColor: '#1f2937' }}>
                                <span {...cvEditableArray('educations', i, 'content', 'block', {}, schoolMajor)} />
                              </td>
                            </tr>
                          )}
                          {i < eduCount - 1 && handleInsertEducationAt && (
                            <tr>
                              <td colSpan={3} className="border p-0.5 text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f3f4f6' }}>
                                <button type="button" onClick={() => handleInsertEducationAt(i + 1)} className="text-xs text-amber-600 hover:text-amber-800">挿入</button>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    <tr>
                      <td colSpan={3} className="border p-1 text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                        <button type="button" onClick={handleAddEducation} className="text-xs flex items-center justify-center gap-1 mx-auto text-blue-600 hover:text-blue-800">
                          <Plus className="w-3.5 h-3.5" /> 行を追加
                        </button>
                      </td>
                    </tr>
                    {/* 職歴 */}
                    <tr>
                      <th className="border p-1.5 text-xs font-normal text-center" style={{ borderColor: '#1f2937', width: '8%' }}>年</th>
                      <th className="border p-1.5 text-xs font-normal text-center" style={{ borderColor: '#1f2937', width: '8%' }}>月</th>
                      <th className="border p-1.5 text-xs font-normal text-center" style={{ borderColor: '#1f2937' }}>職歴</th>
                    </tr>
                    {Array.from({ length: workCount }).map((_, i) => {
                      const emp = formData.workExperiences?.[i] || {};
                      const rawName = (emp.company_name || emp.description || '').trim();
                      return (
                        <React.Fragment key={`emp-${i}`}>
                          <tr>
                            <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('workExperiences', i, 'year', 'block')} /></td>
                            <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('workExperiences', i, 'month', 'block')} /></td>
                            <td className="border p-1.5 text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('workExperiences', i, 'company_name', 'block', {}, rawName)} /></td>
                          </tr>
                          {i < workCount - 1 && handleInsertWorkExperienceAt && (
                            <tr>
                              <td colSpan={3} className="border p-0.5 text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f3f4f6' }}>
                                <button type="button" onClick={() => handleInsertWorkExperienceAt(i + 1)} className="text-xs text-amber-600 hover:text-amber-800">挿入</button>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    <tr>
                      <td colSpan={3} className="border p-1 text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                        <button type="button" onClick={handleAddWorkExperience} className="text-xs flex items-center justify-center gap-1 mx-auto text-blue-600 hover:text-blue-800">
                          <Plus className="w-3.5 h-3.5" /> 行を追加
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }} />
                      <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }} />
                      <td className="border p-1.5 text-xs text-right" style={{ borderColor: '#1f2937' }}>以上</td>
                    </tr>
                    {/* 免許・資格 */}
                    <tr>
                      <th className="border p-1.5 text-xs font-normal text-center" style={{ borderColor: '#1f2937', width: '8%' }}>年</th>
                      <th className="border p-1.5 text-xs font-normal text-center" style={{ borderColor: '#1f2937', width: '8%' }}>月</th>
                      <th className="border p-1.5 text-xs font-normal text-center" style={{ borderColor: '#1f2937' }}>免許・資格</th>
                    </tr>
                    {Array.from({ length: certCount }).map((_, i) => (
                      <React.Fragment key={`cert-${i}`}>
                        <tr>
                          <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', i, 'year', 'block')} /></td>
                          <td className="border p-1.5 text-center text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', i, 'month', 'block')} /></td>
                          <td className="border p-1.5 text-xs" style={{ borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', i, 'name', 'block')} /></td>
                        </tr>
                        {i < certCount - 1 && handleInsertCertificateAt && (
                          <tr>
                            <td colSpan={3} className="border p-0.5 text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f3f4f6' }}>
                              <button type="button" onClick={() => handleInsertCertificateAt(i + 1)} className="text-xs text-amber-600 hover:text-amber-800">挿入</button>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    <tr>
                      <td colSpan={3} className="border p-1 text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                        <button type="button" onClick={handleAddCertificate} className="text-xs flex items-center justify-center gap-1 mx-auto text-blue-600 hover:text-blue-800">
                          <Plus className="w-3.5 h-3.5" /> 行を追加
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            })()}

            {/* 最寄り駅・扶養家族・配偶者 */}
            <table className="w-full border-collapse mt-4" style={{ borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td className="border p-1.5 align-top" style={{ borderColor: '#1f2937', width: '28%' }}>
                    <div className="text-xs text-gray-700">現住所の最寄り駅</div>
                    <div className="mt-1 text-xs min-h-[1.5em]" {...cvEditable('nearestStationName', '')} />
                  </td>
                  <td className="border p-1.5 align-top" style={{ borderColor: '#1f2937', width: '24%' }}>
                    <div className="text-xs text-gray-700">扶養家族数(配偶者を除く)</div>
                    <div className="mt-1 flex items-baseline justify-center">
                      <span className="text-xs" {...cvEditable('dependentsCount', '')} />
                      <span className="text-[10px] text-gray-600 ml-0.5">人</span>
                    </div>
                  </td>
                  <td className="border p-1.5 align-top text-left" style={{ borderColor: '#1f2937', width: '24%' }}>
                    <div className="text-xs text-gray-700">配偶者</div>
                    <div className="mt-1 text-xs text-center">
                      <span className={formData.hasSpouse === '有' ? 'font-semibold' : 'text-gray-400'}>有</span>
                      <span className="text-gray-400 mx-0.5">・</span>
                      <span className={formData.hasSpouse === '無' ? 'font-semibold' : 'text-gray-400'}>無</span>
                    </div>
                  </td>
                  <td className="border p-1.5 align-top text-left" style={{ borderColor: '#1f2937', width: '24%' }}>
                    <div className="text-xs text-gray-700">配偶者の扶養義務</div>
                    <div className="mt-1 text-xs text-center">
                      <span className={formData.spouseDependent === '有' ? 'font-semibold' : 'text-gray-400'}>有</span>
                      <span className="text-gray-400 mx-0.5">・</span>
                      <span className={formData.spouseDependent === '無' ? 'font-semibold' : 'text-gray-400'}>無</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 在留資格 | 在留期限 */}
            <table className="w-full border-collapse mt-4" style={{ borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td className="border p-1.5 align-top text-left" style={{ borderColor: '#1f2937', width: '50%' }}>
                    <div className="text-xs text-gray-700">在留資格</div>
                    <div className="mt-1 text-xs min-h-[2em]" {...cvEditable('jpResidenceStatus', '')} />
                  </td>
                  <td className="border p-1.5 align-top" style={{ borderColor: '#1f2937', width: '50%' }}>
                    <div className="text-xs text-gray-700 text-left">在留期限</div>
                    <div className="mt-1 text-xs min-h-[2em]" {...cvEditable('visaExpirationDate', '')} title="YYYY-MM-DD" />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 自己PR | 趣味・特技 */}
            <table className="w-full border-collapse mt-4" style={{ borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td className="border p-1.5 align-top text-left" style={{ borderColor: '#1f2937', width: '50%' }}>
                    <div className="text-xs text-gray-700">自己PR</div>
                    <div className="mt-1 text-xs min-h-[4rem] whitespace-pre-wrap" {...cvEditable('strengths', '')} />
                  </td>
                  <td className="border p-1.5 align-top text-left" style={{ borderColor: '#1f2937', width: '50%' }}>
                    <div className="text-xs text-gray-700">趣味・特技</div>
                    <div className="mt-1 text-xs min-h-[4rem] whitespace-pre-wrap" {...cvEditable('hobbiesSpecialSkills', '')} />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 志望動機 */}
            <table className="w-full border-collapse mt-4" style={{ borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td className="border p-1.5 align-top text-left" style={{ borderColor: '#1f2937' }}>
                    <div className="text-xs text-gray-700">志望動機</div>
                    <div className="mt-1 text-xs min-h-[5rem] whitespace-pre-wrap" {...cvEditable('motivation', '')} />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 本人希望記入欄 */}
            <table className="w-full border-collapse mt-4" style={{ borderColor: '#1f2937' }}>
              <tbody>
                <tr>
                  <td className="border p-1.5 align-top text-left" style={{ borderColor: '#1f2937' }}>
                    <div className="text-xs text-gray-700 font-medium">本人希望記入欄</div>
                    <ul className="mt-1 text-xs list-none space-y-0.5 pl-0">
                      <li className="flex"><span className="mr-1">-</span><span className="text-gray-600">現在年収:</span><span className="ml-1" {...cvEditable('currentSalary', '')} /></li>
                      <li className="flex"><span className="mr-1">-</span><span className="text-gray-600">希望年収:</span><span className="ml-1" {...cvEditable('desiredSalary', '')} /></li>
                      <li className="flex"><span className="mr-1">-</span><span className="text-gray-600">希望職種:</span><span className="ml-1" {...cvEditable('desiredPosition', '')} /></li>
                      <li className="flex"><span className="mr-1">-</span><span className="text-gray-600">希望勤務地:</span><span className="ml-1" {...cvEditable('desiredLocation', '')} /></li>
                      <li className="flex"><span className="mr-1">-</span><span className="text-gray-600">希望入社日:</span><span className="ml-1" {...cvEditable('desiredStartDate', '')} /></li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== 職務経歴書 ===== */}
      {cvFormatTab === 'shokumu' && (
        <div className="w-full">
          <div className="flex items-center justify-end mb-2">
            <button
              type="button"
              onClick={() => handleBackendPreviewWithOptions('common', 'shokumu')}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors"
              style={{ borderColor: '#d1d5db', color: '#2563eb' }}
            >
              Xem preview 【職務経歴書】
            </button>
          </div>
          <div
            className="w-full"
            style={{ fontSize: '11px', color: '#1f2937', fontFamily: "'MS Mincho', 'MS 明朝', 'Yu Mincho', 'Hiragino Mincho ProN', serif" }}
          >
            <h2 className="text-center font-bold mb-4" style={{ fontSize: '18px' }}>職務経歴書</h2>
            <div className="flex flex-col items-end gap-0.5 text-xs mb-6">
              <span {...cvEditableWithDefault('cvDocumentDate', getDefaultCvDate(true), 'inline-block min-w-[8em]')} />
              <span>氏名 <span {...cvEditable('nameKanji', '')} /></span>
            </div>

            {/* ■職務要約 */}
            <div className="flex items-center gap-1 mb-1.5">
              <span className="inline-block w-4 h-4 leading-4 text-center text-[10px] font-bold text-black">■</span>
              <span className="text-xs font-bold">職務要約</span>
            </div>

            {/* ■職務経歴 */}
            <div className="mt-10 flex items-center gap-1 mb-2">
              <span className="inline-block w-4 h-4 leading-4 text-center text-[10px] font-bold text-black">■</span>
              <span className="text-xs font-bold">職務経歴</span>
            </div>
            <div className="space-y-0 border overflow-hidden" style={{ borderColor: '#1f2937' }}>
              {(() => {
                const list = formData.workExperiences || [];
                const countFromApi = formData.workHistoryCount;
                const blockCount = countFromApi != null ? Math.max(1, countFromApi) : Math.max(1, Math.ceil(list.length / 2));
                return Array.from({ length: blockCount }).map((_, idx) => {
                  const emp = list[idx * 2] || { period: '', company_name: '', business_purpose: '', scale_role: '', description: '', tools_tech: '' };
                  const companyDisplay = (emp.company_name || '').replace(/\s*(退社|入社)\s*$/g, '').trim() || '株式会社○○○○○';
                  return (
                  <div key={idx} className="border-b last:border-b-0" style={{ borderColor: '#1f2937' }}>
                    <div className="flex px-2 py-1.5 text-xs" style={{ backgroundColor: '#f3f4f6' }}>
                      <span className="flex-1" {...cvEditableArray('workExperiences', idx * 2, 'period', 'block', {}, emp.period || '20xx年xx月 ~ 20xx年xx月')} />
                      <span {...cvEditableArray('workExperiences', idx * 2, 'company_name', 'block', {}, companyDisplay)} />
                    </div>
                    <div className="flex px-2 py-1 text-[10px] text-gray-700" style={{ backgroundColor: '#d1d5db' }}>
                      <div className="flex-1">【事業目的】</div>
                      <div className="w-2/5 min-w-[80px] text-right" style={{ maxWidth: '35%' }}>規模 / 役割</div>
                    </div>
                    <div className="flex">
                      <div className="flex-1 border-r border-dotted p-2 min-w-0" style={{ borderColor: '#1f2937' }}>
                        <div className="text-xs whitespace-pre-wrap min-h-[2em] mb-2" {...cvEditableArray('workExperiences', idx * 2, 'business_purpose', 'block', {}, emp.business_purpose)} />
                        <div className="text-[10px] text-gray-600 mb-0.5">【業務内容】</div>
                        <div className="text-xs whitespace-pre-wrap min-h-[2em] mb-2" {...cvEditableArray('workExperiences', idx * 2, 'description', 'block', {}, emp.description)} />
                        <div className="text-[10px] text-gray-600 mb-0.5">【ツール】</div>
                        <div className="text-xs whitespace-pre-wrap min-h-[1.5em]" {...cvEditableArray('workExperiences', idx * 2, 'tools_tech', 'block', {}, emp.tools_tech)} />
                      </div>
                      <div className="w-2/5 min-w-[80px] p-2 flex flex-col" style={{ maxWidth: '35%' }}>
                        <div className="flex-1 text-xs whitespace-pre-wrap w-full min-h-[4em]" {...cvEditableArray('workExperiences', idx * 2, 'scale_role', 'block', { width: '100%', minHeight: '4em' }, emp.scale_role)} />
                      </div>
                    </div>
                  </div>
                  );
                });
              })()}
            </div>
            <div className="flex justify-center mt-2 mb-2">
              <button type="button" onClick={handleAddWorkExperience} className="text-xs flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800">
                <Plus className="w-3.5 h-3.5" /> 行を追加
              </button>
            </div>

            {/* ■活かせる経験・知識・技術 */}
            <div className="flex items-center gap-1 mt-6 mb-1.5">
              <span className="inline-block w-4 h-4 leading-4 text-center text-[10px] font-bold text-black">■</span>
              <span className="text-xs font-bold">活かせる経験・知識・技術</span>
            </div>
            <div className="border min-h-[60px] p-2 text-xs whitespace-pre-wrap mb-4" style={{ borderColor: '#1f2937', backgroundColor: '#fafafa' }} {...cvEditable('technicalSkills', 'block')} />

            {/* ■資格 */}
            <div className="flex items-center gap-1 mb-1.5">
              <span className="inline-block w-4 h-4 leading-4 text-center text-[10px] font-bold text-black">■</span>
              <span className="text-xs font-bold">資格</span>
            </div>
            <table className="w-full border-collapse border mb-1" style={{ borderColor: '#1f2937', fontSize: '10px' }}>
              <tbody>
                {(formData.certificates || []).map((_, i) => (
                  <tr key={`cert-shokumu-${i}`}>
                    <td className="border p-1.5 align-top" style={{ width: '60%', borderColor: '#1f2937' }}><span {...cvEditableArray('certificates', i, 'name', 'block')} /></td>
                    <td className="border p-1.5 align-top whitespace-nowrap" style={{ borderColor: '#1f2937' }}>
                      <span className="inline-flex items-baseline gap-0">
                        <span {...cvEditableArray('certificates', i, 'year', 'inline-block min-w-[2.5em] text-center', { width: '2.5em' })} />年
                        <span {...cvEditableArray('certificates', i, 'month', 'inline-block min-w-[1.5em] text-center', { width: '1.5em' })} />月取得
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mb-4 flex justify-center">
              <button type="button" onClick={handleAddCertificate} className="text-xs flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800">
                <Plus className="w-3.5 h-3.5" /> 行を追加
              </button>
            </div>

            {/* ■自己PR */}
            <div className="flex items-center gap-1 mb-1.5">
              <span className="inline-block w-4 h-4 leading-4 text-center text-[10px] font-bold text-black">■</span>
              <span className="text-xs font-bold">自己PR</span>
            </div>
            <div className="border min-h-[80px] p-2 text-xs whitespace-pre-wrap" style={{ borderColor: '#1f2937', backgroundColor: '#fafafa' }} {...cvEditable('strengths', 'block')} />
          </div>
        </div>
      )}
    </>
  );
};

export default CvTemplateCommon;
