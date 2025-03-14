export interface KycStatusResponse {
    page: number;
    limit: number;
    count: number;
    hasMore: boolean;
    data: KycData[];
}

export interface KycData {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    status: string;
    type: string;
    country: string;
    providerCode: string;
    kycProviderCode: string;
    kycDetailId: string;
    kybDetailId: string;
    kycDetail: KycDetail;
    kybDetail: KybDetail;
    kycAdditionalDocuments: KycAdditionalDocument[];
    statusUpdates: string;
}

export interface KycDetail {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    kybDetailId: string;
    nationality: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    positionAtCompany: string;
    sourceOfFund: string;
    currentKycVerificationId: string;
    currentKycVerification: CurrentKycVerification;
    kycDocuments: KycDocument[];
    kycUrl: string;
    uboType: string;
    percentageOfShares: number;
    joiningDate: string;
}

export interface KycDocument {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    kycDetailId: string;
    documentType: string;
    status: string;
    frontFileName: string;
    backFileName: string;
}

export interface CurrentKycVerification {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    kycDetailId: string;
    kycProviderCode: string;
    externalCustomerId: string;
    externalKycId: string;
    status: string;
    externalStatus: string;
    verifiedAt: string;
}

export interface KybDetail {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    companyName: string;
    companyDescription: string;
    website: string;
    incorporationDate: string;
    incorporationCountry: string;
    incorporationNumber: string;
    companyType: string;
    companyTypeOther: string;
    natureOfBusiness: string;
    natureOfBusinessOther: string;
    sourceOfFund: string;
    sourceOfFundOther: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    email: string;
    phoneNumber: string;
    currentKybVerificationId: string;
    currentKybVerification: CurrentKybVerification;
    kybDocuments: KybDocument[];
    kycDetails: KycDetail[];
    sourceOfFundDescription: string;
    expectedMonthlyVolume: number;
    purposeOfFund: string;
    purposeOfFundOther: string;
    operatesInProhibitedCountries: boolean;
    taxIdentificationNumber: string;
    highRiskActivities: string[];
}

export interface CurrentKybVerification {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    kybDetailId: string;
    kybProviderCode: string;
    externalCustomerId: string;
    externalKybId: string;
    status: string;
    externalStatus: string;
    verifiedAt: string;
}

export interface KybDocument {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    kybDetailId: string;
    documentType: string;
    status: string;
    frontFileName: string;
    backFileName: string;
}

export interface KycAdditionalDocument {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    kycId: string;
    name: string;
    fileName: string;
}