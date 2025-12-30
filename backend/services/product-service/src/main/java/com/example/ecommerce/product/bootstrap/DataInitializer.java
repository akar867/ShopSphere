package com.example.ecommerce.product.bootstrap;

import com.example.ecommerce.product.domain.Product;
import com.example.ecommerce.product.repo.ProductRepository;
import java.math.BigDecimal;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

  private static final String HEADPHONES_NAME = "Wireless Headphones";
  private static final String HEADPHONES_OLD_IMAGE =
      "https://images.unsplash.com/photo-1518441902117-f0a1b3c5b8f8";
  private static final String HEADPHONES_IMAGE =
      "https://images.unsplash.com/photo-1518441902117-f0a1b3c5b8f8?auto=format&fit=crop&w=1200&q=80";

  @Bean
  ApplicationRunner seedProducts(ProductRepository productRepository) {
    return args -> {
      // Fix broken image URLs even if DB already has data (common after first run).
      productRepository
          .findByNameIgnoreCase(HEADPHONES_NAME)
          .filter(p -> p.getImageUrl() == null || p.getImageUrl().isBlank() || HEADPHONES_OLD_IMAGE.equals(p.getImageUrl()))
          .ifPresent(p -> {
            p.setImageUrl(HEADPHONES_IMAGE);
            productRepository.save(p);
          });

      if (productRepository.count() > 0) {
        return;
      }

      productRepository.save(
          new Product(
              "Everyday Sneakers",
              "Lightweight, comfortable sneakers for daily wear.",
              new BigDecimal("59.99"),
              120,
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
          )
      );
      productRepository.save(
          new Product(
              "Minimalist Backpack",
              "Clean, durable backpack with laptop sleeve.",
              new BigDecimal("79.00"),
              55,
              "https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
          )
      );
      productRepository.save(
          new Product(
              "Ceramic Coffee Mug",
              "Matte ceramic mug (350ml). Dishwasher safe.",
              new BigDecimal("14.50"),
              300,
              "https://images.unsplash.com/photo-1517705008128-361805f42e86"
          )
      );
      productRepository.save(
          new Product(
              HEADPHONES_NAME,
              "Over-ear headphones with rich bass and long battery.",
              new BigDecimal("129.99"),
              40,
              HEADPHONES_IMAGE
          )
      );
    };
  }
}

