package com.example.ecommerce.payment.web;

import com.example.ecommerce.payment.dto.ConfirmPaymentRequest;
import com.example.ecommerce.payment.dto.CreatePaymentIntentRequest;
import com.example.ecommerce.payment.dto.PaymentResponse;
import com.example.ecommerce.payment.exception.BadRequestException;
import com.example.ecommerce.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
  private final PaymentService paymentService;

  public PaymentController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  /**
   * Creates a payment intent for the given order (order must belong to the logged-in user).
   * For demo, the only provider is DUMMY.
   */
  @PostMapping("/intent")
  @ResponseStatus(HttpStatus.CREATED)
  public PaymentResponse createIntent(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Authorization") String authorizationHeader,
      @Valid @RequestBody CreatePaymentIntentRequest req
  ) {
    return paymentService.createIntent(requireUserId(jwt), authorizationHeader, req);
  }

  @GetMapping("/{paymentId}")
  public PaymentResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable long paymentId) {
    return paymentService.get(requireUserId(jwt), paymentId);
  }

  @GetMapping("/latest")
  public PaymentResponse latest(@AuthenticationPrincipal Jwt jwt, @RequestParam long orderId) {
    return paymentService.latestForOrder(requireUserId(jwt), orderId);
  }

  /**
   * Simulates a payment gateway callback/confirmation.
   * Frontend calls this to mark payment SUCCEEDED/FAILED, then calls order-service mark-paid if succeeded.
   */
  @PostMapping("/{paymentId}/confirm")
  public PaymentResponse confirm(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable long paymentId,
      @RequestBody(required = false) ConfirmPaymentRequest body
  ) {
    boolean success = body == null || body.success();
    return paymentService.confirm(requireUserId(jwt), paymentId, success);
  }

  private static long requireUserId(Jwt jwt) {
    Object uid = jwt.getClaim("uid");
    if (uid instanceof Integer i) return i.longValue();
    if (uid instanceof Long l) return l;
    if (uid instanceof String s) return Long.parseLong(s);
    throw new BadRequestException("Missing uid claim in token");
  }
}

