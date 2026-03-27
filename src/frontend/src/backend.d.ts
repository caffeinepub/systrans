import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ROILead {
    id: bigint;
    name: string;
    hourlyWage: number;
    email: string;
    timestamp: bigint;
    staffHours: number;
    phone: string;
    monthlyRevenue: number;
    totalMonthlyGain: number;
    lostLeads: number;
    avgOrderValue: number;
}
export interface ContactSubmission {
    id: bigint;
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdmin(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteContactSubmission(id: bigint): Promise<boolean>;
    getAllContactSubmissions(): Promise<Array<ContactSubmission>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactSubmissionById(id: bigint): Promise<ContactSubmission | null>;
    getContacts(): Promise<Array<ContactSubmission>>;
    getROILeads(): Promise<Array<ROILead>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContact(name: string, email: string, message: string): Promise<bigint>;
    submitROILead(name: string, email: string, phone: string, monthlyRevenue: number, staffHours: number, lostLeads: number, hourlyWage: number, avgOrderValue: number, totalMonthlyGain: number): Promise<bigint>;
}
