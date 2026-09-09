import CustomAPIError from "./CustomAPIError";

class BadRequestError extends CustomAPIError {
    constructor(message: string) {
        super(message, 400);
    }
}

export default BadRequestError;