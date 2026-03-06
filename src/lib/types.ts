/** 楼内送药表单数据（父子级结构） */
export interface LouneiSongyaoPayload {
  type: "楼内送药";
  name: string;
  phone: string;
  hospital: string;
  building: string;
  floor: string;
  department: string;
  room: string;
  bed: string;
  timestamp: string;
}

/** 楼内送药表单数据（旧版，保留兼容） */
export interface NeibuFormData {
  type: "neibu";
  roomNumber: string;
  patientName: string;
  medicineList: string;
  remark?: string;
  submitTime: string;
}

/** 外送送药表单数据（地址结构） */
export interface WaibuSongyaoPayload {
  type: "外送送药";
  name: string;
  phone: string;
  community: string;
  street: string;
  building: string;
  unit: string;
  floor: string;
  room: string;
  timestamp: string;
}

/** 外送送药表单数据（旧版，保留兼容） */
export interface WaibuFormData {
  type: "waibu";
  recipientName: string;
  phone: string;
  address: string;
  medicineList: string;
  remark?: string;
  submitTime: string;
}

export type FormDataType =
  | NeibuFormData
  | WaibuFormData
  | LouneiSongyaoPayload
  | WaibuSongyaoPayload;

export type FormType = "neibu" | "waibu";

/** 二维码记录 */
export interface QRCodeRecord {
  id: string;              // 唯一ID (UUID)
  number: number;          // 顺序编号 (1, 2, 3...)
  type: FormType;          // 送药类型
  createdAt: string;       // 创建时间 ISO
  createdBy?: string;      // 业务员ID (未来扩展)
}

/** 客户提交记录 */
export interface SubmissionRecord {
  id: string;                    // 唯一ID (UUID)
  qrCodeId: string;              // 关联的二维码ID
  qrNumber: number;              // 二维码编号 (冗余,便于查询)
  formData: LouneiSongyaoPayload | WaibuSongyaoPayload;
  submittedAt: string;           // 提交时间 ISO
}

/** 列表项中客户填写信息预览 */
export interface SubmissionPreview {
  name: string;
  phone: string;
  /** 简短摘要，如 "楼内 5楼501" 或 "外送 松浦观江国际" */
  summary?: string;
}

/** 二维码列表项 */
export interface QRListItem {
  id: string;
  number: number;
  type: FormType;
  createdAt: string;
  hasSubmission: boolean;
  /** 已填写时展示客户信息预览 */
  submissionPreview?: SubmissionPreview | null;
}
