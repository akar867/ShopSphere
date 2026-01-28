package com.example.shadowdeploy.api;

import com.example.shadowdeploy.exception.BadRequestException;
import com.example.shadowdeploy.exception.NotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
    List<ApiError.FieldViolation> fields =
        ex.getBindingResult().getFieldErrors().stream()
            .map(GlobalExceptionHandler::toViolation)
            .collect(Collectors.toList());
    return build(HttpStatus.BAD_REQUEST, "Validation failed", request, fields);
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
    return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request, List.of());
  }

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ApiError> handleNotFound(NotFoundException ex, HttpServletRequest request) {
    return build(HttpStatus.NOT_FOUND, ex.getMessage(), request, List.of());
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest request) {
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error", request, List.of());
  }

  private static ApiError.FieldViolation toViolation(FieldError fe) {
    return new ApiError.FieldViolation(fe.getField(), fe.getDefaultMessage());
  }

  private static ResponseEntity<ApiError> build(
      HttpStatus status,
      String message,
      HttpServletRequest request,
      List<ApiError.FieldViolation> fieldViolations
  ) {
    ApiError body =
        new ApiError(
            Instant.now(),
            status.value(),
            status.getReasonPhrase(),
            message,
            request.getRequestURI(),
            null,
            fieldViolations
        );
    return ResponseEntity.status(status).body(body);
  }
}
