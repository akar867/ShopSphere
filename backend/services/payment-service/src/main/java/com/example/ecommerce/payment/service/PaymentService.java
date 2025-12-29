package com.example.ecommerce.payment.service;

import com.example.ecommerce.payment.client.OrderClient;
import com.example.ecommerce.payment.domain.PaymentEntity;
import com.example.ecommerce.payment.domain.PaymentStatus;
import com.example.ecommerce.payment.dto.CreatePaymentIntentRequest;
import com.example.ecommerce.payment.dto.PaymentResponse;
import com.example.ecommerce.payment.exception.BadRequestException;
import com.example.ecommerce.payment.exception.NotFoundException;
import com.example.ecommerce.payment.gateway.PaymentGateway;
import com.example.ecommerce.payment.repo.PaymentRepository;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {
  private final PaymentRepository paymentRepository;
  private final PaymentGateway paymentGateway;
  private final OrderClient orderClient;

  public PaymentService(PaymentRepository paymentRepository, PaymentGateway paymentGateway, OrderClient orderClient) {
    this.paymentRepository = paymentRepository;
    this.paymentGateway = paymentGateway;
    this.orderClient = orderClient;
  }

  @Transactional
  public PaymentResponse createIntent(long userId, String authorizationHeader, CreatePaymentIntentRequest req) {
    String provider = (req.provider() == null || req.provider().isBlank()) ? paymentGateway.provider()
        : req.provider().trim().toUpperCase(Locale.ROOT);
    if (!paymentGateway.provider().equalsIgnoreCase(provider)) {
      throw new BadRequestException("Unsupported payment provider: " + provider);
    }

    OrderClient.OrderSnapshot order = orderClient.getOrder(req.orderId(), authorizationHeader);
    if (order.totalAmount() == null || order.totalAmount().signum() <= 0) {
      throw new BadRequestException("Order total must be positive");
    }
    if (!"PAYMENT_PENDING".equalsIgnoreCase(order.status())) {
      throw new BadRequestException("Order is not ready for payment (status=" + order.status() + ")");
    }

    PaymentGateway.CreateIntentResult intent =
        paymentGateway.createIntent(order.totalAmount(), order.currency(), order.id());

    PaymentEntity entity =
        new PaymentEntity(
            order.id(),
            userId,
            paymentGateway.provider(),
            order.totalAmount(),
            order.currency(),
            intent.providerPaymentId(),
            intent.clientSecret()
        );

    return toDto(paymentRepository.save(entity));
  }

  @Transactional(readOnly = true)
  public PaymentResponse get(long userId, long paymentId) {
    PaymentEntity p =
        paymentRepository.findByIdAndUserId(paymentId, userId).orElseThrow(() -> new NotFoundException("Payment not found"));
    return toDto(p);
  }

  @Transactional(readOnly = true)
  public PaymentResponse latestForOrder(long userId, long orderId) {
    PaymentEntity p =
        paymentRepository
            .findTopByOrderIdAndUserIdOrderByCreatedAtDesc(orderId, userId)
            .orElseThrow(() -> new NotFoundException("Payment not found for order " + orderId));
    return toDto(p);
  }

  @Transactional
  public PaymentResponse confirm(long userId, long paymentId, boolean success) {
    PaymentEntity p =
        paymentRepository.findByIdAndUserId(paymentId, userId).orElseThrow(() -> new NotFoundException("Payment not found"));

    if (p.getStatus() == PaymentStatus.SUCCEEDED) {
      return toDto(p);
    }
    if (p.getStatus() == PaymentStatus.FAILED) {
      return toDto(p);
    }

    p.setStatus(success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED);
    return toDto(paymentRepository.save(p));
  }

  private static PaymentResponse toDto(PaymentEntity p) {
    return new PaymentResponse(
        p.getId(),
        p.getOrderId(),
        p.getUserId(),
        p.getProvider(),
        p.getStatus().name(),
        p.getAmount(),
        p.getCurrency(),
        p.getProviderPaymentId(),
        p.getClientSecret(),
        p.getCreatedAt(),
        p.getUpdatedAt()
    );
  }
}

