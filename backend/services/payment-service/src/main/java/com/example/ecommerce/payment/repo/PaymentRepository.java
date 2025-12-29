package com.example.ecommerce.payment.repo;

import com.example.ecommerce.payment.domain.PaymentEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
  Optional<PaymentEntity> findByIdAndUserId(Long id, Long userId);
  Optional<PaymentEntity> findTopByOrderIdAndUserIdOrderByCreatedAtDesc(Long orderId, Long userId);
}

