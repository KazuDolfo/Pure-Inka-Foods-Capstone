
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductService } from 'services/product.service';
import { CartService } from 'services/cart.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ProductCard, FormsModule],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements OnInit, OnDestroy {
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  selectedCategoryId: string = '';

  getProducts = () => this.productService.getProducts();

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

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(async term => {
      this.searchTerm = term;
      await this.productService.loadProducts(this.searchTerm, this.selectedCategoryId);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  async selectCategory(id: string): Promise<void> {
    this.selectedCategoryId = id;
    await this.productService.loadProducts(this.searchTerm, this.selectedCategoryId);
  }

  async clearFilters(): Promise<void> {
    this.searchTerm = '';
    this.selectedCategoryId = '';
    await this.productService.loadProducts();
  }
}
