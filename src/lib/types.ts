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
