package com.example.cms.common.error;

public class NotFoundException extends ApiException {
    public NotFoundException(String message) {
        super(ErrorCode.NOT_FOUND, message);
    }
}
