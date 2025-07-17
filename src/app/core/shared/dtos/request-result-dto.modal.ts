
export class RequestResultDto<Body> {
constructor(
    public code?: number,
    public data?: Body,
    public details?: any,
    public message?: string,
    public status?: string,
    public timestamp?: any,
) {}
}
