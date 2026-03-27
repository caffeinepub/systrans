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
export interface JobPosting {
    id: bigint;
    title: string;
    description: string;
    location: string;
    jobType: string;
    salaryRange: string;
    department: string;
    isActive: boolean;
    createdAt: bigint;
}
export interface JobApplication {
    id: bigint;
    jobId: bigint;
    jobTitle: string;
    applicantName: string;
    yearsExperience: number;
    currentCTC: string;
    expectedCTC: string;
    resumeBlobId: string;
    resumeFileName: string;
    appliedAt: bigint;
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
    becomeFirstAdmin(): Promise<void>;
    createJobPosting(title: string, description: string, location: string, jobType: string, salaryRange: string, department: string): Promise<bigint>;
    deleteContactSubmission(id: bigint): Promise<boolean>;
    deleteJobPosting(id: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactSubmissionById(id: bigint): Promise<ContactSubmission | null>;
    getContacts(): Promise<Array<ContactSubmission>>;
    getJobApplications(): Promise<Array<JobApplication>>;
    getJobPostings(): Promise<Array<JobPosting>>;
    getAllJobPostings(): Promise<Array<JobPosting>>;
    getROILeads(): Promise<Array<ROILead>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasAdminBeenAssigned(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContact(name: string, email: string, message: string): Promise<bigint>;
    submitJobApplication(jobId: bigint, applicantName: string, yearsExperience: number, currentCTC: string, expectedCTC: string, resumeBlobId: string, resumeFileName: string): Promise<bigint>;
    submitROILead(name: string, email: string, phone: string, monthlyRevenue: number, staffHours: number, lostLeads: number, hourlyWage: number, avgOrderValue: number, totalMonthlyGain: number): Promise<bigint>;
}
