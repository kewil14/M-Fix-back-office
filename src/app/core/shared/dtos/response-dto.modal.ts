
export class ResponseDto<Body> {
constructor(
public body?: Body,
public status?: string,
public messages?: Array<string>,
) {}
}
