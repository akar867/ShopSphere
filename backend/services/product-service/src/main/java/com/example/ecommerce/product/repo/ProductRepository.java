package com.example.ecommerce.product.repo;

import com.example.ecommerce.product.domain.Product;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
  Page<Product> findByActiveTrueAndNameContainingIgnoreCase(String q, Pageable pageable);
  Page<Product> findByActiveTrue(Pageable pageable);
  Optional<Product> findByNameIgnoreCase(String name);
}

