package com.example.ecommerce.order.service;

import com.example.ecommerce.order.client.ProductClient;
import com.example.ecommerce.order.domain.OrderEntity;
import com.example.ecommerce.order.domain.OrderItemEntity;
import com.example.ecommerce.order.domain.OrderStatus;
import com.example.ecommerce.order.dto.CreateOrderItemRequest;
import com.example.ecommerce.order.dto.CreateOrderRequest;
import com.example.ecommerce.order.dto.OrderItemResponse;
import com.example.ecommerce.order.dto.OrderResponse;
import com.example.ecommerce.order.dto.PageResponse;
import com.example.ecommerce.order.exception.BadRequestException;
import com.example.ecommerce.order.exception.NotFoundException;
import com.example.ecommerce.order.repo.OrderRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
  private final OrderRepository orderRepository;
  private final ProductClient productClient;

  public OrderService(OrderRepository orderRepository, ProductClient productClient) {
    this.orderRepository = orderRepository;
    this.productClient = productClient;
  }

  @Transactional
  public OrderResponse create(long userId, CreateOrderRequest req) {
    if (req.items().size() > 100) {
      throw new BadRequestException("Too many items in a single order");
    }

    OrderEntity order = new OrderEntity(userId);
    order.setStatus(OrderStatus.PAYMENT_PENDING);

    BigDecimal total = BigDecimal.ZERO;
    for (CreateOrderItemRequest item : req.items()) {
      if (item.quantity() <= 0) {
        throw new BadRequestException("Quantity must be at least 1");
      }

      ProductClient.ProductSnapshot p = productClient.getProduct(item.productId());
      if (p == null || !p.active()) {
        throw new BadRequestException("Product is not available: " + item.productId());
      }
      if (p.stockQty() < item.quantity()) {
        throw new BadRequestException("Insufficient stock for product " + item.productId());
      }

      OrderItemEntity oi = new OrderItemEntity(p.id(), p.name(), p.price(), item.quantity());
      order.addItem(oi);
      total = total.add(oi.getLineTotal());
    }

    order.setTotalAmount(total);
    OrderEntity saved = orderRepository.save(order);
    return toDto(saved);
  }

  @Transactional(readOnly = true)
  public PageResponse<OrderResponse> listMyOrders(long userId, int page, int size) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 50);

    Page<OrderEntity> p = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(safePage, safeSize));

    List<OrderResponse> items = p.getContent().stream().map(OrderService::toDto).toList();
    return new PageResponse<>(items, p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.hasNext(),
        p.hasPrevious());
  }

  @Transactional(readOnly = true)
  public OrderResponse getMyOrder(long userId, long orderId) {
    OrderEntity order =
        orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
    if (!order.getUserId().equals(userId)) {
      // Don't leak existence.
      throw new NotFoundException("Order not found: " + orderId);
    }
    return toDto(order);
  }

  @Transactional
  public OrderResponse markPaid(long userId, long orderId) {
    OrderEntity order =
        orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
    if (!order.getUserId().equals(userId)) {
      throw new NotFoundException("Order not found: " + orderId);
    }
    if (order.getStatus() != OrderStatus.PAYMENT_PENDING) {
      throw new BadRequestException("Order is not in PAYMENT_PENDING state");
    }
    order.setStatus(OrderStatus.PAID);
    return toDto(orderRepository.save(order));
  }

  private static OrderResponse toDto(OrderEntity o) {
    List<OrderItemResponse> items =
        o.getItems().stream()
            .map(i -> new OrderItemResponse(i.getId(), i.getProductId(), i.getProductName(), i.getUnitPrice(),
                i.getQuantity(), i.getLineTotal()))
            .toList();
    return new OrderResponse(
        o.getId(),
        o.getUserId(),
        o.getStatus().name(),
        o.getTotalAmount(),
        o.getCurrency(),
        items,
        o.getCreatedAt(),
        o.getUpdatedAt()
    );
  }
}

