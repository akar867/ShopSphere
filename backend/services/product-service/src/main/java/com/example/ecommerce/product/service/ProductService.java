package com.example.ecommerce.product.service;

import com.example.ecommerce.product.domain.Product;
import com.example.ecommerce.product.dto.PageResponse;
import com.example.ecommerce.product.dto.ProductResponse;
import com.example.ecommerce.product.dto.UpsertProductRequest;
import com.example.ecommerce.product.exception.NotFoundException;
import com.example.ecommerce.product.repo.ProductRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {
  private final ProductRepository productRepository;

  public ProductService(ProductRepository productRepository) {
    this.productRepository = productRepository;
  }

  @Transactional(readOnly = true)
  public PageResponse<ProductResponse> list(String q, int page, int size, String sortBy, String direction) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);

    Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
    String safeSortBy =
        switch (sortBy == null ? "" : sortBy) {
          case "price" -> "price";
          case "createdAt" -> "createdAt";
          case "name" -> "name";
          default -> "createdAt";
        };

    PageRequest pr = PageRequest.of(safePage, safeSize, Sort.by(dir, safeSortBy));

    Page<Product> p =
        (q != null && !q.isBlank())
            ? productRepository.findByActiveTrueAndNameContainingIgnoreCase(q.trim(), pr)
            : productRepository.findByActiveTrue(pr);

    List<ProductResponse> items = p.getContent().stream().map(ProductService::toDto).toList();

    return new PageResponse<>(
        items,
        p.getNumber(),
        p.getSize(),
        p.getTotalElements(),
        p.getTotalPages(),
        p.hasNext(),
        p.hasPrevious(),
        safeSortBy + "," + dir.name().toLowerCase()
    );
  }

  @Transactional(readOnly = true)
  public ProductResponse get(long id) {
    Product p =
        productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product not found: " + id));
    return toDto(p);
  }

  @Transactional
  public ProductResponse create(UpsertProductRequest req) {
    Product p = new Product(req.name(), req.description(), req.price(), req.stockQty(), req.imageUrl());
    p.setActive(req.active());
    return toDto(productRepository.save(p));
  }

  @Transactional
  public ProductResponse update(long id, UpsertProductRequest req) {
    Product p =
        productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product not found: " + id));
    p.setName(req.name());
    p.setDescription(req.description());
    p.setPrice(req.price());
    p.setStockQty(req.stockQty());
    p.setImageUrl(req.imageUrl());
    p.setActive(req.active());
    return toDto(productRepository.save(p));
  }

  private static ProductResponse toDto(Product p) {
    return new ProductResponse(
        p.getId(),
        p.getName(),
        p.getDescription(),
        p.getPrice(),
        p.getStockQty(),
        p.getImageUrl(),
        p.isActive(),
        p.getCreatedAt()
    );
  }
}

