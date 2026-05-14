export declare class RequestDetailsDto {
    description: string;
    budget?: number;
    [key: string]: any;
}
export declare class LocationZoneDto {
    kifleKetema: string;
    woreda: string;
}
export declare class CreateRequestDto {
    category: string;
    type?: 'real_estate' | 'furniture';
    details: RequestDetailsDto;
    metadata?: Record<string, any>;
    locationZone: LocationZoneDto;
}
