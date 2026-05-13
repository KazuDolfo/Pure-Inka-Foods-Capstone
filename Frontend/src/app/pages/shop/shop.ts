// src/app/pages/shop/shop.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductService } from 'services/product.service';
import { CartService } from 'services/cart.service';
import { PageHeader } from '../../components/page-header/page-header';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ProductCard, FormsModule, PageHeader],
  templateUrl: './shop.html',
  styleUrls: ['./shop.scss'],
})
export class Shop implements OnInit {
  searchTerm: string = '';
  selectedCategoryId: number | null = null;

  getProducts = () => {
    let prods = this.productService.getProducts();
    if (this.searchTerm) {
      prods = prods.filter(p => p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
    if (this.selectedCategoryId) {
      prods = prods.filter(p => p.id_categoria === this.selectedCategoryId);
    }
    return prods;
  };

  getCategories = () => this.productService.getCategories();
  getLoading = () => this.productService.isLoadingProducts();
  getLoadingCategories = () => this.productService.isLoadingCategories();
  getError = () => this.productService.getErrorProducts();
  getErrorCategories = () => this.productService.getErrorCategories();

  constructor(
    public cartService: CartService,
    private productService: ProductService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.productService.loadProducts();
    await this.productService.loadCategories();
  }

  onSearchInput(): void {
    // El filtrado es por computed/getter
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedCategoryId = value ? parseInt(value, 10) : null;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
  }
}
