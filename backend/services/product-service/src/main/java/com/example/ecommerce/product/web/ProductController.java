package com.example.ecommerce.product.web;

import com.example.ecommerce.product.dto.PageResponse;
import com.example.ecommerce.product.dto.ProductResponse;
import com.example.ecommerce.product.dto.UpsertProductRequest;
import com.example.ecommerce.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {
  private final ProductService productService;

  public ProductController(ProductService productService) {
    this.productService = productService;
  }

  /**
   * Public endpoint (no auth) for browsing products.
   *
   * Examples:
   * - /api/products?page=0&size=12&sortBy=createdAt&direction=desc
   * - /api/products?q=shoe&page=0&size=12&sortBy=price&direction=asc
   */
  @GetMapping
  public PageResponse<ProductResponse> list(
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String direction
  ) {
    return productService.list(q, page, size, sortBy, direction);
  }

  @GetMapping("/{id}")
  public ProductResponse get(@PathVariable long id) {
    return productService.get(id);
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  @ResponseStatus(HttpStatus.CREATED)
  public ProductResponse create(@Valid @RequestBody UpsertProductRequest req) {
    return productService.create(req);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ProductResponse update(@PathVariable long id, @Valid @RequestBody UpsertProductRequest req) {
    return productService.update(id, req);
  }
}

