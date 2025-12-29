package com.example.ecommerce.payment.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
    name = "payment",
    indexes = {
        @Index(name = "idx_payment_order", columnList = "orderId"),
        @Index(name = "idx_payment_user", columnList = "userId")
    }
)
public class PaymentEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long orderId;

  @Column(nullable = false)
  private Long userId;

  @Column(nullable = false, length = 32)
  private String provider;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private PaymentStatus status = PaymentStatus.INITIATED;

  @Column(nullable = false, precision = 19, scale = 2)
  private BigDecimal amount;

  @Column(nullable = false, length = 3)
  private String currency;

  @Column(nullable = false, length = 128, unique = true)
  private String providerPaymentId;

  @Column(nullable = false, length = 256)
  private String clientSecret;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  protected PaymentEntity() {}

  public PaymentEntity(
      Long orderId,
      Long userId,
      String provider,
      BigDecimal amount,
      String currency,
      String providerPaymentId,
      String clientSecret
  ) {
    this.orderId = orderId;
    this.userId = userId;
    this.provider = provider;
    this.amount = amount;
    this.currency = currency;
    this.providerPaymentId = providerPaymentId;
    this.clientSecret = clientSecret;
  }

  public Long getId() {
    return id;
  }

  public Long getOrderId() {
    return orderId;
  }

  public Long getUserId() {
    return userId;
  }

  public String getProvider() {
    return provider;
  }

  public PaymentStatus getStatus() {
    return status;
  }

  public void setStatus(PaymentStatus status) {
    this.status = status;
    this.updatedAt = Instant.now();
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public String getCurrency() {
    return currency;
  }

  public String getProviderPaymentId() {
    return providerPaymentId;
  }

  public String getClientSecret() {
    return clientSecret;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}

