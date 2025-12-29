package com.example.ecommerce.order.web;

import com.example.ecommerce.order.dto.CreateOrderRequest;
import com.example.ecommerce.order.dto.OrderResponse;
import com.example.ecommerce.order.dto.PageResponse;
import com.example.ecommerce.order.exception.BadRequestException;
import com.example.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public OrderResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateOrderRequest req) {
    return orderService.create(requireUserId(jwt), req);
  }

  @GetMapping("/my")
  public PageResponse<OrderResponse> myOrders(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    return orderService.listMyOrders(requireUserId(jwt), page, size);
  }

  @GetMapping("/{orderId}")
  public OrderResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable long orderId) {
    return orderService.getMyOrder(requireUserId(jwt), orderId);
  }

  /**
   * Demo-friendly endpoint used after payment confirmation.
   * In real systems, you'd typically update this via a payment webhook.
   */
  @PostMapping("/{orderId}/mark-paid")
  public OrderResponse markPaid(@AuthenticationPrincipal Jwt jwt, @PathVariable long orderId) {
    return orderService.markPaid(requireUserId(jwt), orderId);
  }

  private static long requireUserId(Jwt jwt) {
    Object uid = jwt.getClaim("uid");
    if (uid instanceof Integer i) return i.longValue();
    if (uid instanceof Long l) return l;
    if (uid instanceof String s) return Long.parseLong(s);
    throw new BadRequestException("Missing uid claim in token");
  }
}

