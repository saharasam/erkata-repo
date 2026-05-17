export declare class RequestDetailsDto {
    title: string;
    description: string;
    budget?: number;
}
export declare class RequestMetadataDto {
    intent?: string;
    constructionStatus?: string;
    bedrooms?: string;
    bankLoan?: string;
    customization?: string;
    targetRoom?: string;
    paymentPlan?: string;
}
export declare class LocationZoneDto {
    kifleKetema: string;
    woreda: string;
}
export declare class CreateRequestDto {
    category: string;
    type?: 'real_estate' | 'furniture';
    details: RequestDetailsDto;
    metadata?: RequestMetadataDto;
    locationZone: LocationZoneDto;
}
